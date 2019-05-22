import React, { Component } from "react";
import ReactDOM from "react-dom";

const modalRoot =
  document.getElementById("modal-root") || document.createElement("div");

interface ModalProps {
  close: () => void;
}
class Modal extends Component<ModalProps> {
  render() {
    return ReactDOM.createPortal(
      <div className="modal-bg">
        <div className="modal">
          <span className="closeButton" onClick={this.props.close}>
            ×
          </span>
          {this.props.children}
        </div>
      </div>,
      modalRoot
    );
  }
}

export default Modal;
