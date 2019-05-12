import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  //Link,
  withRouter,
  RouteComponentProps
} from "react-router-dom";
import "./App.css";
import APIURL from "./ApiURL";
import Board from "./Board";

class App extends Component {
  state = {
    boards: []
  };
  componentDidMount() {
    fetch(`${APIURL}/`, {
      method: "get"
    })
      .then(res => res.json())
      .then(boards => {
        this.setState({ boards });
      });
  }
  render() {
    return (
      <Router>
        <div className="App">
          <BoardMenu boards={this.state.boards} />
          <Route path="/" exact component={Welcome} />
          <Route path="/board/:id" exact component={Board} />
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
