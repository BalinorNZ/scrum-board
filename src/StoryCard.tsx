import { Story } from "./JiraInterfaces";
import React from "react";
import Avatars from "./Avatars";

interface StoryProps {
  story: Story;
  selectedAvatars: string[];
}
const StoryCard = ({ story, selectedAvatars }: StoryProps) => {
  const epicColor =
    (story.fields.epic && story.fields.epic.color.key) || "none";
  return (
    <li className="story" key={story.id}>
      <div className="story-menu-toggle">...</div>
      <ul className="story-menu">
        <li>To-do</li>
        <li>In Progress</li>
        <li>Done</li>
      </ul>
      <section className="story-summary-section">
        <p className="summary">{story.fields.summary}</p>
        {story.fields.epic && (
          <p className="epic">
            <span className={epicColor + " epic-label"}>
              {story.fields.epic.name}
            </span>
          </p>
        )}
      </section>
      <section className="avatars">
        {Object.keys(story.fields.subtasks).length ? (
          <Avatars
            subtasks={story.fields.subtasks}
            selectedAvatars={selectedAvatars}
          />
        ) : (
          <img
            alt="assignee avatar"
            className="avatar"
            src={
              story.fields.assignee && story.fields.assignee.avatarUrls["32x32"]
            }
          />
        )}
      </section>
      <section className="story-details">
        <span className="issueid">{story.key}</span>
        <img
          className="priority"
          alt="priority icon"
          src={story.fields.priority.iconUrl}
        />
        <span className="storypoints">{story.fields.customfield_10806}</span>
      </section>
    </li>
  );
};

export default StoryCard;
