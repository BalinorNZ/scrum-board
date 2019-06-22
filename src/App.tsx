import React, { Component } from "react";
import { Router, Route } from "react-router-dom";
import "./App.css";
import APIURL from "./ApiURL";
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
    fetch(`${APIURL}/`, {
      method: "get"
    })
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
        const boardId = history.location.pathname.substring(
          history.location.pathname.lastIndexOf("/") + 1
        );
        this.context.updateBoardId(parseInt(boardId));
        this.setState({ boards });
      });
  }
  onChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.context.updateIsFetching(true);
    const selectedBoard: JiraBoard =
      this.state.boards.find(
        (board: JiraBoard) => board.id === parseInt(e.currentTarget.value)
      ) || ({} as JiraBoard);
    const projectKey =
      selectedBoard &&
      selectedBoard.location &&
      selectedBoard.location.projectKey;
    this.context.updateProjectKey(projectKey);
    this.context.updateBoardId(parseInt(e.currentTarget.value));
    history.push(`/board/${e.currentTarget.value}`);
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

const Welcome = () => <div>Welcome! Please select a board to view.</div>;
