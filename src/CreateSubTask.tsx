import React from "react";
import { Story } from "./JiraInterfaces";

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
      description: "",
      issuetype: { id: "5" }
    };
    console.log(body);
  };
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
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
