import React, { Component } from "react";

interface SeparatorProps {
  placeholder?: React.ReactElement<HTMLElement> | null;
  innerRef: any;
  snapshot: any;
}
class Separator extends Component<SeparatorProps> {
  render() {
    const { placeholder, snapshot } = this.props;
    return (
      <div
        className="story-subtask-groups-separator"
        ref={this.props.innerRef}
        style={{
          backgroundColor: snapshot.isDraggingOver
            ? "rgb(234, 67, 53)"
            : "inherit"
        }}
      >
        {placeholder}
      </div>
    );
  }
}

export default Separator;
