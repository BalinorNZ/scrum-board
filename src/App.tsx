import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
//import fetch, {RequestInit, Request, Headers} from 'node-fetch';
//import * as fs from 'fs-extra';
//import * as _ from 'lodash';
//import moment from 'moment';

const ATLASSIAN_USERNAME = '';
const ATLASSIAN_API_KEY = '';
const BOARD_NAME = 'Education Scrum Board';
const JIRA_URL = 'https://adinstruments.atlassian.net';

class App extends Component {
  state = {};
  componentWillMount() {

  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
