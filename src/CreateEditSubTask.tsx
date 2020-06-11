import React from "react";
import { Actor, Story, SubTask } from "./JiraInterfaces";
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
  subtask?: SubTask;
}
class CreateSubTask extends React.Component<CreateSubTaskProps> {
  static contextType = BoardContext;

  state: Readonly<CreateSubTaskState> = {
    subtaskSummary: this.props.subtask ? this.props.subtask.fields.summary : "",
    selectedAvatar:
      this.props.subtask && this.props.subtask.fields.assignee
        ? this.props.subtask.fields.assignee.accountId
        : (this.props.story.fields.assignee &&
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
    // TODO: reduce code duplication in edit/create modes
    if (this.props.subtask) {
      // EDIT MODE
      const body = {
        summary: this.state.subtaskSummary,
        assignee: { id: this.state.selectedAvatar }
      };
      fetch(`${APIURL}/issue/${this.props.subtask.key}`, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(result => {
          if (result === 204) {
            if (!this.props.subtask) return;
            this.updateSubtaskOnBoard(this.props.subtask.id);
          } else {
            console.log("Failed to update subtask!");
          }
        });
    } else {
      // CREATE MODE
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
        issuetype: { id: "10009" },
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
          this.updateSubtaskOnBoard(result.id);
        });
    }
  };
  // TODO: could refactor this code into saveSubtask() in board context
  updateSubtaskOnBoard = (subtaskId: string) => {
    // fetch the issue we just created and add it to the board
    fetch(`${APIURL}/issue/${subtaskId}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(issue => {
        this.context.saveSubtask(issue, this.props.story.id);
      });
  };
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ subtaskSummary: e.target.value });
  };
  confirmDelete = () => {
    if(!this.props.subtask) return;
    console.log("Are you sure you want to delete this subtask?" + this.props.subtask.fields.summary);
  };
  render() {
    console.log(this.props.subtask);
    return (
      <div className="subtask-modal">
        {this.props.subtask ? (
          <span className="subtask-modal-issue-id">
            {this.props.subtask.key}
          </span>
        ) : (
          ""
        )}
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
          {this.props.subtask ? (
            <p>{this.props.subtask.fields.summary}</p>
          ) : (
            ""
          )}
          <h2 className="subtask-modal-status-title">Assignee</h2>
          {this.props.assignees.map((assignee: Actor, index: number) => (
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
          ))}
          {/* TODO: add 'status' toggle thing here */}
          {this.props.subtask ? (
            <>
            <h2 className="subtask-modal-status-title">Status</h2>
            <div className="subtask-modal-status">{this.props.subtask.fields.status.name}</div>
            </>
          ) : (
            ""
          )}
          <input
            className={"subtask-modal-button background-blue" + (this.props.subtask ? " left" : "")}
            type="submit"
            value="Save"
          />
          {this.props.subtask &&
          <button
            className="subtask-modal-button background-red right"
            type="button"
            onClick={() => this.confirmDelete()}
          >Delete</button>
          }
        </form>
      </div>
    );
  }
}

export default CreateSubTask;
