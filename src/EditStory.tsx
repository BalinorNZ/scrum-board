import React from "react";
import { Story } from "./JiraInterfaces";

interface EditStoryProps {
  story: Story;
}
const EditStory = (props: EditStoryProps) => {
  const story = props.story;
  return (
    <div className="subtask-modal">
      <span className="subtask-modal-issue-id">{story.key}</span>
      <h1>{story.fields.summary}</h1>
      <p>{story.fields.description}</p>
      <h2 className="subtask-modal-status-title">Assignee</h2>
      <img
        title={story.fields.assignee && story.fields.assignee.displayName}
        alt=""
        className="avatar"
        src={story.fields.assignee && story.fields.assignee.avatarUrls["32x32"]}
      />
      <h2 className="subtask-modal-status-title">Status</h2>
      <div className="subtask-modal-status">{story.fields.status.name}</div>
    </div>
  );
};

export default EditStory;
