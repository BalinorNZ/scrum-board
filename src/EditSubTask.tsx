import React from "react";
import { SubTask } from "./JiraInterfaces";

interface EditSubTaskProps {
  subtask: SubTask;
}
const EditSubTask = (props: EditSubTaskProps) => {
  const subtask = props.subtask;
  return (
    <div className="subtask-modal">
      <span className="subtask-modal-issue-id">{subtask.key}</span>
      <h1>{subtask.fields.summary}</h1>
      <p>{subtask.fields.description}</p>
      <p>Assignee</p>
      <img
        title={subtask.fields.assignee && subtask.fields.assignee.displayName}
        alt=""
        className="avatar"
        src={
          subtask.fields.assignee && subtask.fields.assignee.avatarUrls["48x48"]
        }
      />
      <p>Status</p>
      <p>{subtask.fields.status.name}</p>
      <p>Comments</p>
    </div>
  );
};

export default EditSubTask;
