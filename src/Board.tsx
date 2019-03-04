import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { Issue, Story, SubTask } from "./JiraInterfaces";
import groupBy from "lodash.groupby";

interface BoardState {
  stories: Issue[];
}

interface BoardRouterProps {
  id: string;
}
interface BoardProps extends RouteComponentProps<BoardRouterProps> {}

class Board extends Component<BoardProps, BoardState> {
  state = { stories: [] };
  componentDidMount() {
    fetch(`${APIURL}/board/${this.props.match.params.id}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ stories }) => {
        this.setState({ stories });
      });
  }
  render() {
    return (
      <div>
        <h2>
          Stories for Board {this.props.match.params.id} (
          {this.state.stories.length} stories)
        </h2>
        {this.state.stories.length === 0 && <div>Loading...</div>}
        <ul>
          {this.state.stories.map((story: Story) => (
            <StoryCard story={story} />
          ))}
        </ul>
      </div>
    );
  }
}

export default Board;

interface StoryProps {
  story: Story;
}

const StoryCard = ({ story }: StoryProps) => {
  const groupedAssignees = groupBy(
    story.fields.subtasks,
    (subtask: any) =>
      subtask.fields.assignee && subtask.fields.assignee.avatarUrls["32x32"]
  );
  //console.log(groupedAssignees);
  const epicColor =
    (story.fields.epic && story.fields.epic.color.key) || "none";
  return (
    <li className="story" key={story.id}>
      <section className="summary">{story.fields.summary}</section>
      <section className={"epic"}>
        <span className={epicColor + " epic-label"}>
          {story.fields.epic && story.fields.epic.name}
        </span>
      </section>
      <br />
      <section className="story-details">
        <span className="issueid">{story.key}</span>
        <img className="priority" src={story.fields.priority.iconUrl} />
        <span className="storypoints">{story.fields.customfield_10806}</span>
      </section>
      <br />
      {Object.keys(groupedAssignees).length ? (
        Object.keys(groupedAssignees).map((key: any, index) => (
          <div className="avatar-with-count">
            <img key={index} className="avatar" src={key} />
            <span>{groupedAssignees[key].length}</span>
          </div>
        ))
      ) : (
        <img
          className="avatar"
          src={story.fields.assignee.avatarUrls["32x32"]}
        />
      )}
    </li>
  );
};

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
