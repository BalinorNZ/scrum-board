import React from "react";
import { Actor, Story } from "./JiraInterfaces";
import APIURL from "./ApiURL";
import { BoardContext } from "./BoardContext";

interface CreateSubTaskState {
  subtaskSummary: string;
  selectedAvatar: string;
}
interface CreateSubTaskProps {
  story: Story;
  assignees: Actor[];
  close: () => void;
}
class CreateSubTask extends React.Component<CreateSubTaskProps> {
  static contextType = BoardContext;

  state: Readonly<CreateSubTaskState> = {
    subtaskSummary: "",
    selectedAvatar:
      (this.props.story.fields.assignee &&
        this.props.story.fields.assignee.accountId) ||
      ""
  };
  selectAvatar = (e: React.MouseEvent<HTMLElement>, assignee: Actor) => {
    this.setState({ selectedAvatar: assignee.accountId });
  };
  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.close();
    if (!this.state.subtaskSummary) return;
    const body = {
      project: { key: this.context.projectKey },
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
      issuetype: { id: "5" },
      assignee: { id: this.state.selectedAvatar }
    };
    fetch(`${APIURL}/issue`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(result => {
        fetch(`${APIURL}/issue/${result.id}`, {
          method: "get"
        })
          .then(res => res.json())
          .then(issue => this.context.saveSubtask(issue, this.props.story.id));
      });
  };
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ subtaskSummary: e.target.value });
  };
  render() {
    return (
      <div className="subtask-modal">
        <form onSubmit={this.handleSubmit}>
          <h2 className="subtask-modal-status-title">Summary</h2>
          <input
            className="subtask-modal-summary"
            type="text"
            value={this.state.subtaskSummary}
            onChange={e => this.handleChange(e)}
            placeholder="What needs to be done?"
            autoFocus
          />
          <h2 className="subtask-modal-status-title">Assignee</h2>
          {this.props.assignees.map((assignee: Actor, index: number) => {
            return (
              <div
                key={index}
                className={
                  this.state.selectedAvatar &&
                  this.state.selectedAvatar === assignee.accountId
                    ? "avatar-with-count selected"
                    : "avatar-with-count"
                }
                onClick={e => this.selectAvatar(e, assignee)}
              >
                <img
                  title={assignee.displayName}
                  key={index}
                  alt="assignee avatar"
                  className="avatar"
                  src={assignee.avatarUrls["48x48"]}
                />
              </div>
            );
          })}
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
