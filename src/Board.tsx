import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { STATUS, Story, SubTask } from "./JiraInterfaces";
import Spinner from "./Spinner";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import StorySubTasks from "./StorySubTasks";
import StoryCard from "./StoryCard";
import Avatars from "./Avatars";
import Ellipsis from "./Ellipsis";
import Separator from "./Separator";
import groupBy from "lodash.groupby";
import { BoardContext } from "./BoardContext";
import EpicFilter from "./EpicFilter";

const TRANSITIONS: any = {
  [STATUS.todo]: "11",
  [STATUS.inProgress]: "21",
  [STATUS.done]: "31",
  [STATUS.blocked]: "71",
  [STATUS.closed]: "11111",
  [STATUS.pendingReview]: "",
};

interface BoardState {
  selectedAvatars: string[];
  hideTodo: boolean;
}

interface BoardRouterProps {
  id: string;
}
interface BoardProps extends RouteComponentProps<BoardRouterProps> {}

class Board extends Component<BoardProps, BoardState> {
  static contextType = BoardContext;

  state: Readonly<BoardState> = {
    selectedAvatars: [],
    hideTodo: true
  };
  timer: null | number = null;
  componentWillUnmount() {
    if (this.timer != null) clearInterval(this.timer);
    this.timer = null;
  }
  selectAvatar = (e: React.MouseEvent<HTMLElement>, name: string) => {
    if (e.shiftKey) {
      this.state.selectedAvatars.includes(name)
        ? this.setState({
            selectedAvatars: this.state.selectedAvatars.filter(
              avatar => avatar !== name
            )
          })
        : this.setState({
            selectedAvatars: [...this.state.selectedAvatars, name]
          });
    } else {
      this.state.selectedAvatars.includes(name)
        ? this.setState({ selectedAvatars: [] })
        : this.setState({ selectedAvatars: [name] });
    }
  };
  onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    let allSubtasks = this.context.allSubtasks;
    let index = allSubtasks.findIndex((s: SubTask) => s.id === draggableId);
    allSubtasks[index].fields.status.id = destination.droppableId;

    fetch(`${APIURL}/issue/${allSubtasks[index].id}/transitions`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transition: { id: TRANSITIONS[destination.droppableId] }
      })
    })
      .then(res => res.json())
      .then(
        status =>
          status.result === 204 && this.context.updateSubtasks(allSubtasks)
      );
  };
  transitionStory = (statusId: string, storyId: string) => {
    let stories = this.context.stories;
    let index = stories.findIndex((s: Story) => s.id === storyId);
    stories[index].fields.status.id = statusId;

    fetch(`${APIURL}/issue/${stories[index].id}/transitions`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transition: { id: TRANSITIONS[statusId] }
      })
    })
      .then(res => res.json())
      .then(
        status => status.result === 204 && this.context.updateStories(stories)
      );
  };
  isBlocked = (id: string) => {
    const story: Story =
      this.context.stories.find((story: Story) => story.id === id) ||
      ({} as Story);
    return story.fields.subtasks.filter(
      (subtask: SubTask) => subtask.fields.status.id === STATUS.blocked
    ).length;
  };
  isPendingReview = (id: string) => {
    const story: Story =
      this.context.stories.find((story: Story) => story.id === id) ||
      ({} as Story);
    return story.fields.status.id === STATUS.pendingReview || story.fields.subtasks.filter(
      (subtask: SubTask) => subtask.fields.status.id === STATUS.pendingReview
    ).length;
  };
  handleCollapse = () => {
    this.setState({ hideTodo: !this.state.hideTodo });
  };

  render() {
    const storiesFilteredByEpic = this.context.selectedEpic
      ? this.context.stories.filter((story: Story) => {
          if (this.context.selectedEpic.key === null && !story.fields.epic)
            return true;
          return (
            story.fields.epic &&
            story.fields.epic.key === this.context.selectedEpic.key
          );
        })
      : this.context.stories;
    const storiesFilteredByAssignees = this.state.selectedAvatars.length
      ? storiesFilteredByEpic.filter((story: Story) => {
          const storyAssignees = [
            ...story.fields.subtasks.map(
              subtask =>
                subtask.fields.assignee && subtask.fields.assignee.displayName
            ),
            story.fields.assignee && story.fields.assignee.displayName
          ];
          return storyAssignees.some(
            (assignee?: string) =>
              assignee !== undefined &&
              this.state.selectedAvatars.includes(assignee)
          );
        })
      : storiesFilteredByEpic;
    const inProgress = storiesFilteredByAssignees.filter(
      (story: Story) =>
        story.fields.status.id === STATUS.inProgress ||
        story.fields.status.id === STATUS.blocked ||
        story.fields.status.id === STATUS.pendingReview
    );
    const toDo = storiesFilteredByAssignees.filter(
      (story: Story) => story.fields.status.id === STATUS.todo
    );
    const done = storiesFilteredByAssignees.filter(
      (story: Story) =>
        story.fields.status.id === STATUS.done
    );
    return (
      <div className="board">
        <div className="board-header">
          {this.context.isFetching ? (
            <Ellipsis />
          ) : (
            <>
              <div>
                <span className="sprint-title">{this.context.sprint.name}</span>
                <span className="story-count">
                  {this.context.stories.length} stories
                </span>
                <p className="sprint-dates">
                  <span>{formatDate(this.context.sprint.startDate)}</span>
                  <span className="divider">•</span>
                  <span>{formatDate(this.context.sprint.endDate)}</span>
                </p>
              </div>
              <Avatars
                selectAvatar={this.selectAvatar}
                selectedAvatars={this.state.selectedAvatars}
                subtasks={this.context.allSubtasks}
              />
              <EpicFilter />
            </>
          )}
        </div>
        {this.context.isFetching ? (
          <Spinner />
        ) : (
          <ul className={"columns" + (this.state.hideTodo ? " hide-todo" : "")}>
            <li className="todo-column">
              <div className="column-header">
                {this.state.hideTodo
                  ? `(${toDo.length})`
                  : `Sprint Backlog(${toDo.length} stories) ${sumStorypoints(
                      toDo
                    )}SP`}
                <span
                  className="collapse-button"
                  onClick={() => this.handleCollapse()}
                >
                  {this.state.hideTodo ? <>&rsaquo;</> : <>&lsaquo;</>}
                </span>
              </div>
              <ul>
                {toDo.map((story: Story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    selectedAvatars={this.state.selectedAvatars}
                    transitionStory={this.transitionStory}
                    assignees={getAssigneeListFromSubtasks(
                      this.context.allSubtasks
                    )}
                  />
                ))}
              </ul>
            </li>
            <li className="inprogress-column">
              <div className="column-header">
                <span className="in-progress-title">
                  In Progress ({inProgress.length} stories){" "}
                  {sumStorypoints(inProgress)}SP
                </span>
                <div className="column-header-subtask-headings">
                  <span className="todo">TO DO</span>
                  <span className="in-progress">
                    <span className="blue">IN PROGRESS</span>/
                    <span className="red">BLOCKED</span>
                  </span>
                  <span className="done">DONE</span>
                </div>
              </div>
              <ul>
                {inProgress.map((story: Story) => (
                  <div
                    className={
                      "story-with-subtasks" +
                      (this.isBlocked(story.id) ? " blocked" : "") +
                      (this.isPendingReview(story.id) ? " pendingReview" : "")
                    }
                    key={story.id}
                  >
                    <StoryCard
                      story={story}
                      selectedAvatars={this.state.selectedAvatars}
                      transitionStory={this.transitionStory}
                      assignees={getAssigneeListFromSubtasks(
                        this.context.allSubtasks
                      )}
                    />
                    <DragDropContext onDragEnd={this.onDragEnd}>
                      <div className="story-subtask-groups">
                        <Droppable droppableId={STATUS.todo}>
                          {(provided, snapshot) => (
                            <StorySubTasks
                              snapshot={snapshot}
                              innerRef={provided.innerRef}
                              placeholder={provided.placeholder}
                              {...provided.droppableProps}
                              story={story}
                              status={[STATUS.todo]}
                              selectedAvatars={this.state.selectedAvatars}
                              assignees={getAssigneeListFromSubtasks(
                                this.context.allSubtasks
                              )}
                            />
                          )}
                        </Droppable>
                        <div className="story-subtask-groups-separator" />
                        <Droppable droppableId={STATUS.inProgress}>
                          {(provided, snapshot) => (
                            <StorySubTasks
                              snapshot={snapshot}
                              innerRef={provided.innerRef}
                              placeholder={provided.placeholder}
                              {...provided.droppableProps}
                              story={story}
                              status={[STATUS.inProgress, STATUS.blocked]}
                              selectedAvatars={this.state.selectedAvatars}
                              assignees={getAssigneeListFromSubtasks(
                                this.context.allSubtasks
                              )}
                            />
                          )}
                        </Droppable>
                        <Droppable droppableId={STATUS.blocked}>
                          {(provided, snapshot) => (
                            <Separator
                              snapshot={snapshot}
                              innerRef={provided.innerRef}
                              placeholder={provided.placeholder}
                              {...provided.droppableProps}
                            />
                          )}
                        </Droppable>
                        <Droppable droppableId={STATUS.done}>
                          {(provided, snapshot) => (
                            <StorySubTasks
                              snapshot={snapshot}
                              innerRef={provided.innerRef}
                              placeholder={provided.placeholder}
                              {...provided.droppableProps}
                              story={story}
                              status={[STATUS.done, STATUS.pendingReview]}
                              selectedAvatars={this.state.selectedAvatars}
                              assignees={getAssigneeListFromSubtasks(
                                this.context.allSubtasks
                              )}
                            />
                          )}
                        </Droppable>
                      </div>
                    </DragDropContext>
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
                  <StoryCard
                    key={story.id}
                    story={story}
                    selectedAvatars={this.state.selectedAvatars}
                    transitionStory={this.transitionStory}
                    assignees={getAssigneeListFromSubtasks(
                      this.context.allSubtasks
                    )}
                  />
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

function getAssigneeListFromSubtasks(subtasks: SubTask[]) {
  const groupedSubtasks = groupBy(
    subtasks,
    (subtask: SubTask) =>
      subtask.fields.assignee && subtask.fields.assignee.avatarUrls["48x48"]
  );
  return Object.keys(groupedSubtasks).map(
    (key: any) => groupedSubtasks[key][0].fields.assignee || { displayName: "" }
  );
}

function sumStorypoints(stories: Story[]) {
  return stories.reduce(
    (acc: number, cur: Story) => acc + cur.fields.customfield_10016,
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

// function slugify(string: string) {
//   const a = "àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
//   const b = "aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
//   const p = new RegExp(a.split("").join("|"), "g");
//   return string
//     .toString()
//     .toLowerCase()
//     .replace(/\s+/g, "-") // Replace spaces with
//     .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
//     .replace(/&/g, "-and-") // Replace & with ‘and’
//     .replace(/[^\w-]+/g, "") // Remove all non-word characters
//     .replace(/--+/g, "-") // Replace multiple — with single -
//     .replace(/^-+/, "") // Trim — from start of text
//     .replace(/-+$/, ""); // Trim — from end of text
// }
