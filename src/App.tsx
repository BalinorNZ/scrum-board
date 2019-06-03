import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  withRouter,
  RouteComponentProps
} from "react-router-dom";
import "./App.css";
import APIURL from "./ApiURL";
import Board from "./Board";
import { Authenticate } from "./Auth";

class App extends Component {
  state = {
    boards: [],
    authenticated: false
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
        this.setState({ boards });
      });
  }
  render() {
    return !this.state.authenticated ? (
      <Authenticate />
    ) : (
      <Router>
        <div className="App">
          <BoardMenu boards={this.state.boards} />
          <Route path="/" exact component={Welcome} />
          <Route
            path="/board/:id"
            exact
            render={routeProps => (
              <Board {...routeProps} boards={this.state.boards} />
            )}
          />
        </div>
      </Router>
    );
  }
}
export default App;

type PathParamsType = {};
type BoardSelectProps = RouteComponentProps<PathParamsType> & {
  boards: any[];
};
class BoardSelect extends Component<BoardSelectProps> {
  onChange = (e: React.FormEvent<HTMLSelectElement>) => {
    this.props.history.push(`${e.currentTarget.value}`);
  };
  render() {
    return (
      <select className="board-menu" onChange={this.onChange}>
        <option value="Select a board">Select a board</option>
        {this.props.boards.map((board: any) => (
          <option value={`/board/${board.id}`} key={board.id}>
            {board.name}
          </option>
        ))}
      </select>
    );
  }
}
const BoardMenu = withRouter(BoardSelect);

const Welcome = () => <div>Welcome! Please select a board to view.</div>;
