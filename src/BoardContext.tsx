import * as React from "react";
import { Sprint, Story, SubTask } from "./JiraInterfaces";
import APIURL from "./ApiURL";

const defaultBoardContext = {
  projectKey: "",
  boardId: 0,
  sprint: {} as Sprint,
  stories: [],
  allSubtasks: []
  // selectedAvatars: []
};

type BoardContextState = typeof defaultBoardContext;
type BoardContextProps = {
  projectKey: string;
  boardId: number;
};
export const BoardContext = React.createContext<BoardContextState>(
  defaultBoardContext
);

class BoardContextProvider extends React.Component<
  BoardContextProps,
  BoardContextState
> {
  public state = defaultBoardContext;

  async componentWillReceiveProps(newProps: BoardContextProps) {
    const sprint = await this.fetchSprint(newProps.boardId);
    const stories = await this.fetchStories(newProps.boardId);
    const allSubtasks =
      stories &&
      stories.reduce(
        (acc: SubTask[], cur: Story) => acc.concat(cur.fields.subtasks),
        []
      );
    this.setState({
      projectKey: newProps.projectKey,
      boardId: newProps.boardId,
      sprint,
      stories,
      allSubtasks
    });

    // TODO: disable auto-refresh during dev
    //setInterval(() => this.fetchStories(), 20000);
  }

  private fetchSprint = async (boardId: number) => {
    return fetch(`${APIURL}/board/${boardId}/sprint`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ sprint }) => sprint);
  };
  private fetchStories = async (boardId: number) => {
    return fetch(`${APIURL}/board/${boardId}`, {
      method: "get"
    })
      .then(res => res.json())
      .then(({ stories }) => stories);
  };

  public updateSubtasks = (subTasks: SubTask[]) => {
    console.log(subTasks);
    // this.setState({allSubtasks: subTasks});
  };

  public updateStories = (stories: Story[]) => {
    console.log(stories);
    // this.setState({stories});
  };

  render() {
    return (
      <BoardContext.Provider
        value={{
          ...this.state,
          updateSubtasks: this.updateSubtasks,
          updateStories: this.updateStories
        }}
      >
        {this.props.children}
      </BoardContext.Provider>
    );
  }
}
export default BoardContextProvider;
