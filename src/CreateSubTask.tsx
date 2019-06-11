import React from "react";
import { Story } from "./JiraInterfaces";
import APIURL from "./ApiURL";

interface CreateSubTaskState {
  subtaskSummary: string;
}
interface CreateSubTaskProps {
  story: Story;
  project: string;
}
class CreateSubTask extends React.Component<CreateSubTaskProps> {
  state: Readonly<CreateSubTaskState> = {
    subtaskSummary: ""
  };
  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!this.state.subtaskSummary) return;
    const body = {
      project: { key: this.props.project },
      parent: { key: this.props.story.key },
      summary: this.state.subtaskSummary,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ text: "", type: "text" }]
          }
        ]
      },
      issuetype: { id: "5" }
    };
    console.log(body);
    fetch(`${APIURL}/issue`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      // TODO: push newly created subtask onto the board
      .then(status => status.result === 204 && console.log(status));
  };
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ subtaskSummary: e.target.value });
  };
  render() {
    const story = this.props.story;
    return (
      <div className="subtask-modal">
        <form onSubmit={this.handleSubmit}>
          <input
            className="subtask-modal-summary"
            type="text"
            value={this.state.subtaskSummary}
            onChange={e => this.handleChange(e)}
            placeholder="What needs to be done?"
          />
          <h2 className="subtask-modal-status-title">Assignee</h2>
          <img
            title={story.fields.assignee && story.fields.assignee.displayName}
            alt=""
            className="avatar"
            src={
              story.fields.assignee && story.fields.assignee.avatarUrls["32x32"]
            }
          />
          <input
            className="subtask-modal-save-button"
            type="submit"
            value="Save"
          />
        </form>
      </div>
    );
  }
}

export default CreateSubTask;
