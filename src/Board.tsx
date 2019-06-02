import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { Sprint, STATUS, Story, SubTask } from "./JiraInterfaces";
import Spinner from "./Spinner";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import StorySubTasks from "./StorySubTasks";
import StoryCard from "./StoryCard";
import Avatars from "./Avatars";
import Ellipsis from "./Ellipsis";
import Separator from "./Separator";

const TRANSITIONS: any = {
  [STATUS.todo]: "11",
  [STATUS.inProgress]: "21",
  [STATUS.done]: "31",
  [STATUS.blocked]: "71",
  [STATUS.closed]: "11111"
};

interface BoardState {
  stories: Story[];
  sprint: Sprint;
  allSubtasks: SubTask[];
  selectedAvatars: string[];
  loading: boolean;
  hideTodo: boolean;
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
    selectedAvatars: [],
    loading: true,
    hideTodo: false
  };
  timer: null | number = null;
  componentDidMount() {
    fetch(`${APIURL}/board/${this.props.match.params.id}/sprint`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ sprint }) => this.setState({ sprint }));

    this.fetchStories(this.props.match.params.id);
    // TODO: disable auto-refresh during dev
    //setInterval(() => this.fetchStories(), 20000);
  }
  componentWillReceiveProps(newProps: BoardProps) {
    this.setState({ loading: true });
    fetch(`${APIURL}/board/${newProps.match.params.id}/sprint`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ sprint }) => this.setState({ sprint }));

    this.fetchStories(newProps.match.params.id);
  }
  componentWillUnmount() {
    if (this.timer != null) clearInterval(this.timer);
    this.timer = null;
  }
  fetchStories(boardId: string) {
    fetch(`${APIURL}/board/${boardId}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ stories }) => {
        const allSubtasks = stories.reduce(
          (acc: SubTask[], cur: Story) => acc.concat(cur.fields.subtasks),
          []
        );
        this.setState({ stories, allSubtasks, loading: false });
      });
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
    let allSubtasks = this.state.allSubtasks;
    let index = allSubtasks.findIndex(s => s.id === draggableId);
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
      .then(status => status.result === 204 && this.setState({ allSubtasks }));
  };
  transitionStory = (statusId: string, storyId: string) => {
    let stories = this.state.stories;
    let index = stories.findIndex(s => s.id === storyId);
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
      .then(status => status.result === 204 && this.setState({ stories }));
  };
  isBlocked = (id: string) => {
    const story: Story =
      this.state.stories.find((story: Story) => story.id === id) ||
      ({} as Story);
    return story.fields.subtasks.filter(
      (subtask: SubTask) => subtask.fields.status.id === STATUS.blocked
    ).length;
  };
  handleCollapse = () => {
    this.setState({hideTodo: !this.state.hideTodo});
  };

  render() {
    const storiesFilteredByAssignees = this.state.selectedAvatars.length
      ? this.state.stories.filter((story: Story) => {
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
      : this.state.stories;
    const inProgress = storiesFilteredByAssignees.filter(
      (story: Story) =>
        story.fields.status.id === STATUS.inProgress ||
        story.fields.status.id === STATUS.blocked
    );
    const toDo = storiesFilteredByAssignees.filter(
      (story: Story) => story.fields.status.id === STATUS.todo
    );
    const done = storiesFilteredByAssignees.filter(
      (story: Story) =>
        story.fields.status.id === STATUS.done ||
        story.fields.status.id === STATUS.closed
    );
    // @ts-ignore
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
          {this.state.loading ? (
            <Ellipsis />
          ) : (
            <Avatars
              selectAvatar={this.selectAvatar}
              selectedAvatars={this.state.selectedAvatars}
              subtasks={this.state.allSubtasks}
            />
          )}
        </div>
        {this.state.loading ? (
          <Spinner />
        ) : (
          <ul className={"columns" + (this.state.hideTodo ? " hide-todo" : "")}>
            <li className="todo-column">
              <div className="column-header">
                {this.state.hideTodo ? `(${toDo.length})` : `Sprint Backlog(${toDo.length} stories) ${sumStorypoints(toDo)}SP`
                }
                <span className="collapse-button" onClick={() => this.handleCollapse()}>
                  {this.state.hideTodo
                    ? <>&rsaquo;</>
                    : <>&lsaquo;</>}
                </span>
              </div>
              <ul>
                {toDo.map((story: Story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    selectedAvatars={this.state.selectedAvatars}
                    transitionStory={this.transitionStory}
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
                      (this.isBlocked(story.id) ? " blocked" : "")
                    }
                    key={story.id}
                  >
                    <StoryCard
                      story={story}
                      selectedAvatars={this.state.selectedAvatars}
                      transitionStory={this.transitionStory}
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
                              status={[STATUS.done, STATUS.closed]}
                              selectedAvatars={this.state.selectedAvatars}
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
