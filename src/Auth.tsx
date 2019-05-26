import React, { Component } from "react";
import APIURL from "./ApiURL";

export class Authenticate extends Component {
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
            You must login with your ADI Google account to access this page.
          </p>
          <a
            className="google-button button large"
            href={APIURL + "/auth/google"}
          >
            <p className="button-text">Sign in with Google</p>
          </a>
        </div>
      </div>
    );
  }
}
