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
      <h2 className="subtask-modal-status-title">Assignee</h2>
      <img
        title={subtask.fields.assignee && subtask.fields.assignee.displayName}
        alt=""
        className="avatar"
        src={
          subtask.fields.assignee && subtask.fields.assignee.avatarUrls["32x32"]
        }
      />
      <h2 className="subtask-modal-status-title">Status</h2>
      <div className="subtask-modal-status">{subtask.fields.status.name}</div>
    </div>
  );
};

export default EditSubTask;
