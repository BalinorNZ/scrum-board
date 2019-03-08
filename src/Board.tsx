import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { Issue, Sprint, Story, SubTask } from "./JiraInterfaces";
import groupBy from "lodash.groupby";
import sortBy from "lodash.sortby";
import Spinner from "./Spinner";

interface BoardState {
  stories: Story[];
  sprint: Sprint;
  allSubtasks: SubTask[];
  selectedAvatars: string[];
}

interface BoardRouterProps {
  id: string;
}
interface BoardProps extends RouteComponentProps<BoardRouterProps> {}

class Board extends Component<BoardProps, BoardState> {
  state: Readonly<BoardState> = {
    stories: [],
    sprint: {} as Sprint,
    allSubtasks: [],
    selectedAvatars: []
  };
  timer: null | number = null;
  componentDidMount() {
    fetch(`${APIURL}/board/${this.props.match.params.id}/sprint`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ sprint }) => this.setState({ sprint }));

    this.fetchStories();
    setInterval(() => this.fetchStories(), 20000);
  }
  componentWillUnmount() {
    if (this.timer != null) clearInterval(this.timer);
    this.timer = null;
  }
  fetchStories() {
    fetch(`${APIURL}/board/${this.props.match.params.id}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ stories }) => {
        const allSubtasks = stories.reduce(
          (acc: SubTask[], cur: Story) => acc.concat(cur.fields.subtasks),
          []
        );
        this.setState({ stories, allSubtasks });
      });
  }
  selectAvatar = (name: string) => {
    this.state.selectedAvatars.includes(name)
      ? this.setState({
          selectedAvatars: this.state.selectedAvatars.filter(
            avatar => avatar !== name
          )
        })
      : this.setState({
          selectedAvatars: [...this.state.selectedAvatars, name]
        });
  };
  render() {
    const storiesFilteredByAssignees = this.state.selectedAvatars.length
      ? this.state.stories.filter((story: Story) => {
          const storyAssignees = [
            ...story.fields.subtasks.map(
              subtask => subtask.fields.assignee.displayName
            ),
            story.fields.assignee.displayName
          ];
          return storyAssignees.some((assignee: string) =>
            this.state.selectedAvatars.includes(assignee)
          );
        })
      : this.state.stories;
    const inProgress = storiesFilteredByAssignees.filter(
      (story: Story) =>
        story.fields.status.name === "In Progress" ||
        story.fields.status.name === "Blocked"
    );
    const toDo = storiesFilteredByAssignees.filter(
      (story: Story) => story.fields.status.name === "To Do"
    );
    const done = storiesFilteredByAssignees.filter(
      (story: Story) =>
        story.fields.status.name === "Done" ||
        story.fields.status.name === "Closed"
    );
    return (
      <div className="board">
        <div className="board-header">
          <div>
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
          <Avatars
            selectAvatar={this.selectAvatar}
            selectedAvatars={this.state.selectedAvatars}
            subtasks={this.state.allSubtasks}
          />
        </div>
        {this.state.stories.length === 0 ? (
          <Spinner />
        ) : (
          <ul className="columns">
            <li className="todo-column">
              <div className="column-header">
                Sprint Backlog ({toDo.length} stories) {sumStorypoints(toDo)}SP
              </div>
              <ul>
                {toDo.map((story: Story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </ul>
            </li>
            <li className="inprogress-column">
              <div className="column-header">
                In Progress ({inProgress.length} stories){" "}
                {sumStorypoints(inProgress)}SP
              </div>
              <ul>
                {inProgress.map((story: Story) => (
                  <div className="story-with-subtasks" key={story.id}>
                    <StoryCard story={story} />
                    <div className="story-subtask-groups">
                      <StorySubtasks story={story} status={["to-do"]} />
                      <div className="story-subtask-groups-separator" />
                      <StorySubtasks
                        story={story}
                        status={["in-progress", "blocked"]}
                      />
                      <div className="story-subtask-groups-separator" />
                      <StorySubtasks
                        story={story}
                        status={["done", "closed"]}
                      />
                    </div>
                  </div>
                ))}
              </ul>
            </li>
            <li className="done-column">
              <div className="column-header">
                Done ({done.length} stories) {sumStorypoints(done)}SP
              </div>
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

interface StorySubtasksProps {
  story: Story;
  status: string[];
}
const StorySubtasks = ({ story, status }: StorySubtasksProps) => {
  let subtasks =
    story.fields.subtasks.length > 0
      ? story.fields.subtasks.filter((subtask: SubTask) =>
          status.find(status => status === slugify(subtask.fields.status.name))
        )
      : [];
  if (status.some(s => s === "done" || s === "closed"))
    subtasks = sortBy(
      subtasks,
      subtask => new Date(subtask.fields.resolutiondate)
    )
      .reverse()
      .slice(0, 4);
  return (
    <div className="story-subtasks">
      {subtasks.map((subtask: SubTask) => (
        <div
          key={subtask.id}
          className="subtask-card"
          title={subtask.fields.summary}
        >
          <div
            className={
              "subtask-card-status " + slugify(subtask.fields.status.name)
            }
          />
          <p>{subtask.fields.summary}</p>
          <img
            alt="assignee avatar"
            className="avatar"
            src={subtask.fields.assignee.avatarUrls["24x24"]}
          />
        </div>
      ))}
    </div>
  );
};

interface StoryProps {
  story: Story;
}
const StoryCard = ({ story }: StoryProps) => {
  const epicColor =
    (story.fields.epic && story.fields.epic.color.key) || "none";
  return (
    <li className="story" key={story.id}>
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
          <Avatars subtasks={story.fields.subtasks} />
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

interface AvatarsProps {
  subtasks: SubTask[];
  selectAvatar?: (name: string) => void;
  selectedAvatars?: string[];
}
const Avatars = ({ subtasks, selectAvatar, selectedAvatars }: AvatarsProps) => {
  const groupedSubtasks = groupBy(
    subtasks,
    (subtask: SubTask) =>
      subtask.fields.assignee && subtask.fields.assignee.avatarUrls["32x32"]
  );
  return (
    <div>
      {Object.keys(groupedSubtasks).map((key: any, index) => (
        <div
          key={index}
          className={
            selectedAvatars &&
            selectedAvatars.includes(
              groupedSubtasks[key][0].fields.assignee.displayName
            )
              ? "avatar-with-count selected"
              : "avatar-with-count"
          }
          onClick={() =>
            selectAvatar &&
            selectAvatar(groupedSubtasks[key][0].fields.assignee.displayName)
          }
        >
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
      ))}
    </div>
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

function sumStorypoints(stories: Story[]) {
  return stories.reduce(
    (acc: number, cur: Story) => acc + cur.fields.customfield_10806,
    0
  );
}

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
