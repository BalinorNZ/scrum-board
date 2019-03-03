import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { Issue } from "./JiraInterfaces";

interface BoardState {
  stories: Issue[];
  subTasks: Issue[];
}

interface BoardRouterProps {
  id: string;
}
interface BoardProps extends RouteComponentProps<BoardRouterProps> {}

class Board extends Component<BoardProps, BoardState> {
  state = { stories: [], subTasks: [] };
  componentDidMount() {
    fetch(`${APIURL}/board/${this.props.match.params.id}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(issues => {
        const stories = issues.filter(
          (story: Issue) => story.fields.issuetype.name === "Story"
        );
        // TODO: collate the subtasks from inside the stories
        const subTasks = issues.filter(
          (story: Issue) => story.fields.issuetype.name === "Sub-Task"
        );
        this.setState({ stories, subTasks });
      });
  }
  render() {
    return (
      <div>
        <h2>
          Stories for Board {this.props.match.params.id} ({
            this.state.stories.length
          }{" "}
          stories, {this.state.subTasks.length} sub-tasks)
        </h2>
        {this.state.stories.length === 0 && <div>Loading...</div>}
        <ul>
          {this.state.stories.map((story: Issue) => (
            <li key={story.id}>{story.fields.summary}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Board;
