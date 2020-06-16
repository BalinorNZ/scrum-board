import React, { Component } from "react";

export class Authenticate extends Component {
  onSubmit = (e: any) => {
    const loginURL: string = process.env.NODE_ENV && process.env.NODE_ENV === "production"
        ? "/api/login"
        : "http://localhost:8080/api/login";
    fetch(loginURL, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: e.currentTarget.username.value, password: e.currentTarget.password.value})
    })
      .then(res => res.json())
      .then(result => {
        localStorage.setItem('scrumboard-token', result.token);
    });
  };
  render() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh"
        }}
      >
        <div
          style={{
            borderColor: "#d3d3d3",
            maxWidth: "400px",
            borderRadius: "5px",
            borderWidth: "1px",
            padding: "10px",
            background: "#f2f2f2",
            textAlign: "center",
            marginBottom: "100px"
          }}
        >
          <h2>Scrum Board</h2>
          <p>
            You must login to access this page.
          </p>
          <form onSubmit={this.onSubmit}>
            <p>
              Username:
              <input type="text" name="username" />
            </p>
            <p>
              Password:
              <input type="password" name="password" />
            </p>
            <input type="submit" value="Login" />
          </form>
        </div>
      </div>
    );
  }
}
