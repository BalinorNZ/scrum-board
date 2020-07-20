import * as React from "react";
import { Epic, Sprint, Story, SubTask } from "./JiraInterfaces";
import fetcher from "./ApiURL";

type BoardContextState = {
  projectKey: string;
  boardId: number;
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
};
const defaultBoardContext: BoardContextState = {
  projectKey: "",
  boardId: 0,
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
  selectEpic: (epic: Epic | undefined) => {}
  // selectedAvatars: []
};

export const BoardContext = React.createContext<BoardContextState>(
  defaultBoardContext
);

class BoardContextProvider extends React.Component<{}, BoardContextState> {
  public state = defaultBoardContext;

  async componentDidUpdate(prevProps: {}, prevState: BoardContextState) {
    if (prevState.boardId === this.state.boardId) return;
    const sprint = await fetchSprint(this.state.boardId);
    const stories = await fetchStories(this.state.boardId);
    const allSubtasks =
      stories &&
      stories.reduce(
        (acc: SubTask[], cur: Story) => acc.concat(cur.fields.subtasks),
        []
      );
    this.setState({
      projectKey: this.state.projectKey,
      boardId: this.state.boardId,
      isFetching: false,
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
          selectEpic: this.selectEpic
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
  if (index > 0) {
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
