import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
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
          <ul>
            {this.state.boards.map((board: any) => (
              <li key={board.id}>
                <Link to={`/board/${board.id}`}>{board.name}</Link>
              </li>
            ))}
          </ul>
          <Route path="/" exact component={Welcome} />
          <Route path="/board/:id" exact component={Board} />
        </div>
      </Router>
    );
  }
}

export default App;

const Welcome = () => <div>Welcome!</div>;
