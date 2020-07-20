import { Story, SubTask } from "./JiraInterfaces";
import {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps
} from "react-beautiful-dnd";
import { Component } from "react";
import React from "react";
import Modal from "./Modal";
import CreateEditSubTask from "./CreateEditSubTask";
import {getAvatar} from "./Utils";
import UnassignedAvatar from "./UnassignedAvatar";

interface StorySubTaskProps {
  subtask: SubTask;
  selectedAvatars: string[];
  innerRef: any;
  draggableProps: DraggableProvidedDraggableProps | null;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  story: Story;
  assignees: any;
}
class StorySubTask extends Component<StorySubTaskProps> {
  state = { showModal: false };
  handleSubTaskClick = () => this.setState({ showModal: true });
  handleCloseModal = () => this.setState({ showModal: false });
  render() {
    const { subtask, selectedAvatars } = this.props;
    return (
      <div
        {...this.props.draggableProps}
        {...this.props.dragHandleProps}
        ref={this.props.innerRef}
        key={subtask.id}
        className={
          subtask.fields.assignee &&
          selectedAvatars.length &&
          !selectedAvatars.includes(subtask.fields.assignee.displayName)
            ? "subtask-card dim"
            : "subtask-card"
        }
        title={subtask.fields.summary}
      >
        <div
          className={
            "subtask-card-status status-id-" + subtask.fields.status.id
          }
        />
        <p onClick={this.handleSubTaskClick}>{subtask.fields.summary}</p>
        { !getAvatar(subtask.fields.assignee) ? (
          <UnassignedAvatar small />
        ) : (
          <img
            title={subtask.fields.assignee && subtask.fields.assignee.displayName}
            alt=""
            className="avatar"
            src={
              subtask.fields.assignee &&
              subtask.fields.assignee.avatarUrls["24x24"]
            }
          />
        )
        }
        {this.state.showModal ? (
          <Modal close={this.handleCloseModal}>
            <CreateEditSubTask
              subtask={subtask}
              story={this.props.story}
              assignees={this.props.assignees}
              close={this.handleCloseModal}
            />
          </Modal>
        ) : null}
      </div>
    );
  }
}

export default StorySubTask;
