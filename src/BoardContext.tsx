import * as React from "react";
import { Epic, Sprint, Story, SubTask, Status } from "./JiraInterfaces";
import fetcher from "./ApiURL";

type BoardContextState = {
  projectKey: string;
  boardId: number;
  statuses: Status[];
  transitions: any[];
  sprint: Sprint;
  stories: Story[];
  allSubtasks: SubTask[];
  selectedEpic: Epic | undefined;
  isFetching: boolean;
  updateIsFetching: (isFetching: boolean) => void;
  updateBoardId: (boardId: number) => void;
  updateProjectKey: (projectKey: string) => void;
  updateSubtasks: (subtasks: SubTask[]) => void;
  updateStories: (stories: Story[]) => void;
  saveSubtask: (subtask: SubTask, storyId: number) => void;
  selectEpic: (epic: Epic | undefined) => void;
  getStatusId: (name: string) => void;
  getTransitionId: (statusId: string) => void;
  slugify: (string: string) => void;
};
const defaultBoardContext: BoardContextState = {
  projectKey: "",
  boardId: 0,
  statuses: [],
  transitions: [],
  sprint: {} as Sprint,
  stories: [] as Story[],
  allSubtasks: [] as SubTask[],
  selectedEpic: undefined,
  isFetching: true,
  updateIsFetching: (isFetching: boolean) => {},
  updateBoardId: (boardId: number) => {},
  updateProjectKey: (projectKey: string) => {},
  updateSubtasks: (subtasks: SubTask[]) => {},
  updateStories: (stories: Story[]) => {},
  saveSubtask: (subtask: SubTask, storyId: number) => {},
  selectEpic: (epic: Epic | undefined) => {},
  getStatusId: (name: string) => {},
  getTransitionId: (statusId: string) => {},
  slugify: (string: string) => {},
  // selectedAvatars: []
};

export const BoardContext = React.createContext<BoardContextState>(
  defaultBoardContext
);

class BoardContextProvider extends React.Component<{}, BoardContextState> {
  public state = defaultBoardContext;

  async componentDidUpdate(prevProps: {}, prevState: BoardContextState) {
    if (prevState.boardId === this.state.boardId) return;
    const boardConfig = await fetchBoardConfig(this.state.boardId);
    const sprint = await fetchSprint(this.state.boardId);
    const stories = await fetchStories(this.state.boardId);
    const allSubtasks =
      stories &&
      stories.reduce(
        (acc: SubTask[], cur: Story) => acc.concat(cur.fields.subtasks),
        []
      );
    const statuses: Status[] = boardConfig.columnConfig.columns.map((column: any) =>
      ({ name: column.name, id: column.statuses[0].id, self: column.statuses[0].self, iconUrl: '' })
    );
    const transitions = await fetchTransitions(stories[0].id);
    this.setState({
      projectKey: this.state.projectKey,
      boardId: this.state.boardId,
      isFetching: false,
      statuses,
      transitions,
      sprint,
      stories,
      allSubtasks
    });
    // TODO: disable auto-refresh during dev
    //setInterval(() => this.fetchStories(), 20000);
  }
  public updateIsFetching = (isFetching: boolean) => {
    this.setState({ isFetching });
  };
  public updateBoardId = (boardId: number) => {
    this.setState({ boardId });
  };
  public updateProjectKey = (projectKey: string) => {
    this.setState({ projectKey });
  };
  public updateSubtasks = (subtasks: SubTask[]) => {
    this.setState({ allSubtasks: subtasks });
  };
  public updateStories = (stories: Story[]) => {
    this.setState({ stories });
  };
  public saveSubtask = (subtask: SubTask, storyId: number) => {
    let stories = this.state.stories;
    const index = stories.findIndex((s: Story) => s.id === String(storyId));
    // if there's a subtask set, update existing subtask instead of pushing new one
    const allSubtasks = updateSubtasks(subtask, this.state.allSubtasks);
    stories[index].fields.subtasks = updateSubtasks(
      subtask,
      stories[index].fields.subtasks
    );
    this.setState({ stories, allSubtasks });
  };
  public selectEpic = (epic: Epic | undefined) => {
    console.log(epic);
    this.setState({ selectedEpic: epic });
  };
  public getStatusId = (name: string) => {
    const status = this.state.statuses &&
      this.state.statuses.find((s: Status) => s.name === name);
    return status ? status['id'] : '';
  }
  public getTransitionId = (statusId: string) => {
    const status = this.state.statuses &&
      this.state.statuses.find((s: Status) => s.id  === statusId);
    const transition = status && this.state.transitions &&
      this.state.transitions.find((t: any) => t.name === status.name);
    return transition ? transition['id'] : '';
  }
  public slugify = (string: string) => {
    const a = "àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
    const b = "aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
    const p = new RegExp(a.split("").join("|"), "g");
    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, "-and-") // Replace & with ‘and’
      .replace(/[^\w-]+/g, "") // Remove all non-word characters
      .replace(/--+/g, "-") // Replace multiple — with single -
      .replace(/^-+/, "") // Trim — from start of text
      .replace(/-+$/, ""); // Trim — from end of text
  }

  render() {
    return (
      <BoardContext.Provider
        value={{
          ...this.state,
          updateIsFetching: this.updateIsFetching,
          updateBoardId: this.updateBoardId,
          updateProjectKey: this.updateProjectKey,
          updateSubtasks: this.updateSubtasks,
          updateStories: this.updateStories,
          saveSubtask: this.saveSubtask,
          selectEpic: this.selectEpic,
          getStatusId: this.getStatusId,
          getTransitionId: this.getTransitionId,
          slugify: this.slugify,
        }}
      >
        {this.props.children}
      </BoardContext.Provider>
    );
  }
}
export default BoardContextProvider;

const updateSubtasks = (subtask: SubTask, subtasks: SubTask[]): SubTask[] => {
  const index = subtasks.findIndex(s => s.key === subtask.key);
  if (index !== -1) {
    return [
      ...subtasks.slice(0, index),
      subtask,
      ...subtasks.slice(index + 1)
    ] as SubTask[];
  } else {
    return subtasks.concat(subtask);
  }
};
const fetchSprint = async (boardId: number) => {
  return fetcher(`board/${boardId}/sprint`,"get")
    .then(res => res.json())
    .then(({ sprint }) => sprint);
};
const fetchStories = async (boardId: number) => {
  return fetcher(`board/${boardId}`,"get")
    .then(res => res.json())
    .then(({ stories }) => stories);
};
const fetchBoardConfig = async (boardId: number) => {
  return fetcher(`board/${boardId}/configuration`,"get")
    .then(res => res.json())
    .then(({ boardConfig }) => boardConfig);
};
const fetchTransitions = async (issueId: number) => {
  return fetcher(`issue/${issueId}/transitions`,"get")
    .then(res => res.json())
    .then(({ transitions }) => transitions);
};
