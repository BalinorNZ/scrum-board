import { STATUS, SubTask } from "./JiraInterfaces";
import groupBy from "lodash.groupby";
import { getAvatar } from "./Utils";
import UnassignedAvatar from "./UnassignedAvatar";
import React from "react";

interface AvatarsProps {
  subtasks: SubTask[];
  selectAvatar?: (e: React.MouseEvent<HTMLElement>, name: string) => void;
  selectedAvatars?: string[];
}
const Avatars = ({ subtasks, selectAvatar, selectedAvatars }: AvatarsProps) => {
  const groupedSubtasks = groupBy(
    subtasks,
    (subtask: SubTask) =>
      getAvatar(subtask.fields.assignee)
  );
  const teamMembers = Object.keys(groupedSubtasks).map((key: string) => ({
    assignee: groupedSubtasks[key][0].fields.assignee || null,
    subtasks: groupedSubtasks[key]
  }));
  return (
    <div>
      {teamMembers
        .sort((a, b) => {
          if (!a.assignee || !b.assignee) return -1;
          if (a.assignee.displayName < b.assignee.displayName) return -1;
          if (a.assignee.displayName > b.assignee.displayName) return 1;
          return 0;
        })
        .map((teamMember, index) => {
          return (
            <div
              key={index}
              className={
                selectedAvatars &&
                teamMember.assignee &&
                selectedAvatars.includes(teamMember.assignee.displayName)
                  ? "avatar-with-count selected"
                  : "avatar-with-count"
              }
              onClick={e =>
                selectAvatar &&
                teamMember.assignee &&
                selectAvatar(e, teamMember.assignee.displayName)
              }
            >
              {teamMember.assignee === null || !getAvatar(teamMember.assignee) ? (
                <UnassignedAvatar />
              ) : (
                <img
                  title={teamMember.assignee.displayName}
                  key={index}
                  alt="assignee avatar"
                  className="avatar"
                  src={getAvatar(teamMember.assignee)}
                />
              )}
              <span>
                {
                  teamMember.subtasks.filter((subtask: SubTask) =>
                    notDone(subtask)
                  ).length
                }
              </span>
            </div>
          );
        })}
    </div>
  );
};

export default Avatars;

function notDone(subtask: SubTask) {
  return (
    subtask.fields.status.id !== STATUS.done &&
    subtask.fields.status.id !== STATUS.closed
  );
}
