import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { Issue, Story, SubTask } from "./JiraInterfaces";

interface BoardState {
  stories: Issue[];
  subtasks: Issue[];
}

interface BoardRouterProps {
  id: string;
}
interface BoardProps extends RouteComponentProps<BoardRouterProps> {}

class Board extends Component<BoardProps, BoardState> {
  state = { stories: [], subtasks: [] };
  componentDidMount() {
    fetch(`${APIURL}/board/${this.props.match.params.id}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ stories, subtasks }) => {
        this.setState({ stories, subtasks });
      });
  }
  render() {
    return (
      <div>
        <h2>
          Stories for Board {this.props.match.params.id} ({
            this.state.stories.length
          }{" "}
          stories, {this.state.subtasks.length} sub-tasks)
        </h2>
        {this.state.stories.length === 0 && <div>Loading...</div>}
        <ul>
          {this.state.stories.map((story: Story) => (
            <li
              className={`status ${slugify(story.fields.status.name)}`}
              key={story.id}
            >
              {story.fields.summary}
              <br />
              {story.fields.epic && story.fields.epic.name} {story.key}{" "}
              {story.fields.customfield_10806} {story.fields.priority.name}
              <img src={story.fields.assignee.avatarUrls["48x48"]} />
              {story.fields.subtasks.map(subtaskRef => {
                const subtask: any = this.state.subtasks.find(
                  (s: SubTask) => s.id === subtaskRef.id
                );
                console.log(subtask);
                if (subtask.fields.assignee)
                  return (
                    <img src={subtask.fields.assignee.avatarUrls["48x48"]} />
                  );
              })}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Board;

function slugify(string: string) {
  const a = "àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
  const b = "aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
  const p = new RegExp(a.split("").join("|"), "g");
  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with ‘and’
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple — with single -
    .replace(/^-+/, "") // Trim — from start of text
    .replace(/-+$/, ""); // Trim — from end of text
}
