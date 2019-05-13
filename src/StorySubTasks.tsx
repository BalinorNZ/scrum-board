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
}
class StorySubTasks extends Component<StorySubTasksProps> {
  render() {
    const { story, status, selectedAvatars, placeholder } = this.props;
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
    return (
      <div className="story-subtasks" ref={this.props.innerRef}>
        {subtasks.map((subtask: SubTask, index) => (
          <Draggable draggableId={subtask.id} index={index} key={subtask.id}>
            {provided => (
              <StorySubTask
                draggableProps={provided.draggableProps}
                dragHandleProps={provided.dragHandleProps}
                innerRef={provided.innerRef}
                subtask={subtask}
                selectedAvatars={selectedAvatars}
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
