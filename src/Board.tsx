import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { Issue, Sprint, Story, SubTask } from "./JiraInterfaces";
import groupBy from "lodash.groupby";
import Spinner from "./Spinner";

interface BoardState {
  stories: Issue[];
  sprint: Sprint | undefined;
}

interface BoardRouterProps {
  id: string;
}
interface BoardProps extends RouteComponentProps<BoardRouterProps> {}

class Board extends Component<BoardProps, BoardState> {
  state = { stories: [], sprint: {} as Sprint };
  componentDidMount() {
    fetch(`${APIURL}/board/${this.props.match.params.id}/sprint`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ sprint }) => this.setState({ sprint }));

    fetch(`${APIURL}/board/${this.props.match.params.id}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ stories }) => {
        // TODO: create allSubtasks list to use for global avatars filter with total subtasks counts
        // let allSubtasks: any[] = [];
        // stories.map((story: Story) =>
        //   allSubtasks.concat(story.fields.subtasks)
        // );
        // console.log(allSubtasks);
        //   groupBy(
        //   stories.fields.subtasks,
        //   (subtask: SubTask) =>
        //     subtask.fields.assignee && subtask.fields.assignee.avatarUrls["32x32"]
        // );
        this.setState({ stories });
      });
  }
  render() {
    const inProgress = this.state.stories.filter(
      (story: Story) =>
        story.fields.status.name === "In Progress" ||
        story.fields.status.name === "Blocked"
    );
    const toDo = this.state.stories.filter(
      (story: Story) => story.fields.status.name === "To Do"
    );
    const done = this.state.stories.filter(
      (story: Story) =>
        story.fields.status.name === "Done" ||
        story.fields.status.name === "Closed"
    );
    return (
      <div className="board">
        <div className="board-header">
          <span className="sprint-title">{this.state.sprint.name}</span>
          <span className="story-count">
            {this.state.stories.length} stories
          </span>
          <p className="sprint-dates">
            <span>{formatDate(this.state.sprint.startDate)}</span>
            <span className="divider">•</span>
            <span>{formatDate(this.state.sprint.endDate)}</span>
          </p>
        </div>
        {this.state.stories.length === 0 ? (
          <Spinner />
        ) : (
          <ul className="columns">
            <li className="todo-column">
              <div className="column-header">
                Sprint Backlog ({toDo.length})
              </div>
              <ul>
                {toDo.map((story: Story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </ul>
            </li>
            <li className="inprogress-column">
              <div className="column-header">
                In Progress ({inProgress.length})
              </div>
              <ul>
                {inProgress.map((story: Story) => (
                  <div className="story-with-subtasks" key={story.id}>
                    <StoryCard key={story.id} story={story} />
                    <div className="story-subtasks">
                      {story.fields.subtasks.length > 0 &&
                        story.fields.subtasks
                          .filter((subtask: SubTask) => notDone(subtask))
                          .slice(0, 4)
                          .map((subtask: SubTask) => (
                            <div
                              key={subtask.id}
                              className="subtask-card"
                              title={subtask.fields.summary}
                            >
                              <div
                                className={
                                  "subtask-card-status " +
                                  slugify(subtask.fields.status.name)
                                }
                              />
                              <p>{subtask.fields.summary}</p>
                              <img
                                alt="assignee avatar"
                                className="avatar"
                                src={
                                  subtask.fields.assignee.avatarUrls["24x24"]
                                }
                              />
                            </div>
                          ))}
                    </div>
                  </div>
                ))}
              </ul>
            </li>
            <li className="done-column">
              <div className="column-header">Done ({done.length})</div>
              <ul>
                {done.map((story: Story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </ul>
            </li>
          </ul>
        )}
      </div>
    );
  }
}

export default Board;

interface StoryProps {
  story: Story;
}

const StoryCard = ({ story }: StoryProps) => {
  const groupedSubtasks = groupBy(
    story.fields.subtasks,
    (subtask: SubTask) =>
      subtask.fields.assignee && subtask.fields.assignee.avatarUrls["32x32"]
  );
  const epicColor =
    (story.fields.epic && story.fields.epic.color.key) || "none";
  return (
    <li className="story" key={story.id}>
      <section>
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
        {Object.keys(groupedSubtasks).length ? (
          Object.keys(groupedSubtasks).map((key: any, index) => (
            <div key={index} className="avatar-with-count">
              {key === "null" ? (
                <UnassignedAvatar />
              ) : (
                <img
                  key={index}
                  alt="assignee avatar"
                  className="avatar"
                  src={key}
                />
              )}
              <span>
                {
                  groupedSubtasks[key].filter((subtask: SubTask) =>
                    notDone(subtask)
                  ).length
                }
              </span>
            </div>
          ))
        ) : (
          <img
            alt="assignee avatar"
            className="avatar"
            src={story.fields.assignee.avatarUrls["32x32"]}
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

const UnassignedAvatar = () => {
  return (
    <svg
      viewBox="0 0 128 128"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      className="avatar-unassigned"
    >
      <g className="sc-fNHLbd jTnqDb">
        <circle cx="64" cy="64" r="64" />
        <g>
          <path d="M103,102.1388 C93.094,111.92 79.3504,118 64.1638,118 C48.8056,118 34.9294,111.768 25,101.7892 L25,95.2 C25,86.8096 31.981,80 40.6,80 L87.4,80 C96.019,80 103,86.8096 103,95.2 L103,102.1388 Z" />
          <path d="M63.9961647,24 C51.2938136,24 41,34.2938136 41,46.9961647 C41,59.7061864 51.2938136,70 63.9961647,70 C76.6985159,70 87,59.7061864 87,46.9961647 C87,34.2938136 76.6985159,24 63.9961647,24" />
        </g>
      </g>
    </svg>
  );
};

function formatDate(ISOdate: Date | undefined) {
  if (ISOdate === undefined) return "";
  const date = new Date(ISOdate);
  return `${date.getDate()} ${date.toLocaleString("en-us", {
    month: "short"
  })} ${date.getFullYear()} ${date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  })}`;
}

function notDone(subtask: SubTask) {
  return (
    subtask.fields.status.name !== "Done" &&
    subtask.fields.status.name !== "Closed"
  );
}

function slugify(string: string) {
  const a = "àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
  const b = "aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
  const p = new RegExp(a.split("").join("|"), "g");
  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with ‘and’
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple — with single -
    .replace(/^-+/, "") // Trim — from start of text
    .replace(/-+$/, ""); // Trim — from end of text
}
