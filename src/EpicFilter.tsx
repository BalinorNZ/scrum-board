import React from "react";
import { BoardContext } from "./BoardContext";
import groupBy from "lodash.groupby";
import { Story } from "./JiraInterfaces";

interface EpicFilterState {
  open: boolean;
}
class EpicFilter extends React.Component<{}, EpicFilterState> {
  static contextType = BoardContext;

  state: EpicFilterState = {
    open: false
  };
  buttonRef = React.createRef() as any;

  handleOutsideClick = (e: any) => {
    if (this.buttonRef && this.buttonRef.current.contains(e.target)) return;
    this.onMenuToggle();
  };

  onMenuToggle = () => {
    if (!this.state.open) {
      document.addEventListener("click", this.handleOutsideClick);
    } else {
      document.removeEventListener("click", this.handleOutsideClick);
    }
    this.setState({ open: !this.state.open });
  };

  render() {
    const groupedStories = groupBy(
      this.context.stories,
      (story: Story) => story.fields.epic && story.fields.epic.name
    );
    const epicList = Object.keys(groupedStories).map((key: string) => ({
      name: key === "null" ? "No Epic Set" : key,
      key: key === "null" ? null : groupedStories[key][0].fields.epic.key,
      stories: groupedStories[key],
      color: groupedStories[key][0].fields.epic
        ? groupedStories[key][0].fields.epic.color && groupedStories[key][0].fields.epic.color.key
        : "#ccc"
    }));
    const buttonBg = this.context.selectedEpic
      ? this.context.selectedEpic.color
      : "auto";
    return (
      <div
        className="epic-filter-dropdown"
        style={{ position: "relative", display: "inline-block" }}
      >
        <div
          className={`epic-filter-button ${buttonBg} ${
            this.state.open ? "open" : ""
          }`}
          ref={this.buttonRef}
          onClick={this.onMenuToggle}
        >
          <span>
            {this.context.selectedEpic && this.context.selectedEpic.name
              ? this.context.selectedEpic.name
              : "Filter by Epic"}
          </span>
          <svg
            focusable="false"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="presentation"
            style={{
              transform: this.state.open ? "rotate(180deg)" : ""
            }}
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        <ul
          className="epic-filter"
          style={{
            top: this.state.open ? "100%" : "90%",
            pointerEvents: this.state.open ? "auto" : "none",
            opacity: this.state.open ? 1 : 0
          }}
        >
          <li
            style={{ backgroundColor: "#f4f5f7" }}
            onClick={() => this.context.selectEpic(undefined)}
          >
            Show all Epics
          </li>
          {epicList.map((epic: any, index: number) => (
            <li
              key={index}
              className={epic.color}
              onClick={() => this.context.selectEpic(epic)}
            >
              {epic.name} ({epic.stories.length})
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default EpicFilter;
