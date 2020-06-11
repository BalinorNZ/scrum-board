import { STATUS, Story, SubTask } from "./JiraInterfaces";
import React, { Component } from "react";
import sortBy from "lodash.sortby";
import { Draggable } from "react-beautiful-dnd";
import StorySubTask from "./StorySubTask";

interface StorySubTasksProps {
  story: Story;
  status: string[];
  selectedAvatars: string[];
  placeholder?: React.ReactElement<HTMLElement> | null;
  innerRef: any;
  snapshot: any;
  assignees: any;
}
class StorySubTasks extends Component<StorySubTasksProps> {
  render() {
    const {
      snapshot,
      story,
      status,
      selectedAvatars,
      placeholder,
      assignees
    } = this.props;
    let subtasks =
      story.fields.subtasks.length > 0
        ? story.fields.subtasks.filter((subtask: SubTask) =>
            status.find(status => status === subtask.fields.status.id)
          )
        : [];
    if (status.some(s => s === STATUS.done || s === STATUS.closed))
      subtasks = sortBy(
        subtasks,
        subtask => new Date(subtask.fields.resolutiondate)
      )
        .reverse()
        .slice(0, 4);
    const STATUS_COLOR: any = {
      10002: "rgb(223, 225, 230)",
      10003: "rgb(222, 235, 255)",
      10004: "rgb(227, 252, 239)",
      10046: "rgb(234, 67, 53)"
    };
    return (
      <div
        className="story-subtasks"
        ref={this.props.innerRef}
        style={{
          backgroundColor: snapshot.isDraggingOver
            ? STATUS_COLOR[status[0]]
            : "inherit"
        }}
      >
        {subtasks.map((subtask: SubTask, index) => (
          <Draggable draggableId={subtask.id} index={index} key={subtask.id}>
            {provided => (
              <StorySubTask
                draggableProps={provided.draggableProps}
                dragHandleProps={provided.dragHandleProps}
                innerRef={provided.innerRef}
                subtask={subtask}
                selectedAvatars={selectedAvatars}
                story={story}
                assignees={assignees}
              />
            )}
          </Draggable>
        ))}
        {placeholder}
      </div>
    );
  }
}

export default StorySubTasks;
