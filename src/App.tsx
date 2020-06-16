import React, { Component } from "react";
import { Router, Route } from "react-router-dom";
import "./App.css";
import fetcher from "./ApiURL";
import Board from "./Board";
import { Authenticate } from "./Auth";
import { Board as JiraBoard } from "./JiraInterfaces";
import { createBrowserHistory } from "history";
import { BoardContext } from "./BoardContext";

const history = createBrowserHistory();

class App extends Component {
  static contextType = BoardContext;
  state = {
    boards: [],
    authenticated: false,
    isFetching: false
  };
  componentDidMount() {
    fetcher("", "get")
      .then(res => {
        if (res.status === 401) {
          console.log("Not authenticated");
          this.setState({ authenticated: false });
          return;
        }
        console.log("Authenticated success");
        this.setState({ authenticated: true });
        return res.json();
      })
      .then(boards => {
        const pathname = history.location.pathname;
        // get the board id (eg 108) from end of path (eg /board/108)
        const boardId = pathname.substring(pathname.lastIndexOf("/") + 1);
        if(!boards) return;
        this.context.updateProjectKey(
          getProjectKeyFromBoardList(boards, parseInt(boardId))
        );
        this.context.updateBoardId(parseInt(boardId));
        this.setState({ boards });
      });
  }
  onChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.context.updateIsFetching(true);
    const boardId = e.currentTarget.value;
    const boards = this.state.boards as [];
    this.context.updateProjectKey(
      getProjectKeyFromBoardList(boards, parseInt(boardId))
    );
    this.context.updateBoardId(parseInt(boardId));
    history.push(`/board/${boardId}`);
  };
  render() {
    return !this.state.authenticated ? (
      <Authenticate />
    ) : (
      <Router history={history}>
        <div className="App">
          <select className="board-menu" onChange={this.onChange}>
            <option value="Select a board">Select a board</option>
            {this.state.boards.map((board: JiraBoard) => (
              <option value={`${board.id}`} key={board.id}>
                {board.name}
              </option>
            ))}
          </select>
          <Route path="/" exact component={Welcome} />
          <Route path="/board/:id" exact component={Board} />
        </div>
      </Router>
    );
  }
}
export default App;

const getProjectKeyFromBoardList = (boards: [], boardId: number) => {
  const selectedBoard: JiraBoard =
    boards.find((board: JiraBoard) => board.id === boardId) ||
    ({} as JiraBoard);
  return (
    selectedBoard && selectedBoard.location && selectedBoard.location.projectKey
  );
};

const Welcome = () => <div>Welcome! Please select a board to view.</div>;
