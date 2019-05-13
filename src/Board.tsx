import React, { Component } from "react";
import APIURL from "./ApiURL";
import { RouteComponentProps } from "react-router";
import { Sprint, STATUS, Story, SubTask } from "./JiraInterfaces";
import Spinner from "./Spinner";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
  DropResult
} from "react-beautiful-dnd";
import StorySubTasks from "./StorySubTasks";
import StoryCard from "./StoryCard";
import Avatars from "./Avatars";

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
    // TODO: disable auto-refresh during dev
    //setInterval(() => this.fetchStories(), 20000);
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
  onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    // TODO: add a way for stories to be marked as blocked
    let allSubtasks = this.state.allSubtasks;
    let index = allSubtasks.findIndex(s => s.id === draggableId);
    allSubtasks[index].fields.status.id = destination.droppableId;

    const TRANSITIONS: any = {
      [STATUS.todo]: "11",
      [STATUS.inProgress]: "21",
      [STATUS.done]: "31",
      [STATUS.blocked]: "71",
      [STATUS.closed]: "11111"
    };
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
      .then(status => status === 204 && this.setState({ allSubtasks }));
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
                  <StoryCard
                    key={story.id}
                    story={story}
                    selectedAvatars={this.state.selectedAvatars}
                  />
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
                    <StoryCard
                      story={story}
                      selectedAvatars={this.state.selectedAvatars}
                    />
                    <DragDropContext onDragEnd={this.onDragEnd}>
                      <div className="story-subtask-groups">
                        <Droppable droppableId={STATUS.todo}>
                          {provided => (
                            <StorySubTasks
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
                          {provided => (
                            <StorySubTasks
                              innerRef={provided.innerRef}
                              placeholder={provided.placeholder}
                              {...provided.droppableProps}
                              story={story}
                              status={[STATUS.inProgress, STATUS.blocked]}
                              selectedAvatars={this.state.selectedAvatars}
                            />
                          )}
                        </Droppable>
                        <div className="story-subtask-groups-separator" />
                        <Droppable droppableId={STATUS.done}>
                          {provided => (
                            <StorySubTasks
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
