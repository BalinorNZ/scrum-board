import { STATUS, Story, SubTask } from "./JiraInterfaces";
import React from "react";
import Avatars from "./Avatars";
import Modal from "./Modal";
import CreateEditSubTask from "./CreateEditSubTask";
import EditStory from "./EditStory";

interface StoryCardState {
  activeMenu: boolean;
  showCreateSubtaskModal: boolean;
  showStoryModal: boolean;
}
interface StoryProps {
  story: Story;
  selectedAvatars: string[];
  transitionStory: (statusId: string, storyId: string) => void;
  assignees: any;
}
class StoryCard extends React.Component<StoryProps> {
  state: Readonly<StoryCardState> = {
    activeMenu: false,
    showCreateSubtaskModal: false,
    showStoryModal: false
  };
  handleStoryClick = () => this.setState({ showStoryModal: true });
  handleCloseStoryModal = () => this.setState({ showStoryModal: false });
  onMenuToggle = () => {
    !this.state.activeMenu
      ? document.addEventListener("click", this.handleOutsideClick, false)
      : document.removeEventListener("click", this.handleOutsideClick, false);
    this.setState({ activeMenu: !this.state.activeMenu });
  };
  handleOutsideClick = (e: any) => {
    // ignore clicks on the component itself
    // (needs "ref={node => { this.node = node; }}" to be set on 'story' li)
    // if (this.node.contains(e.target)) return;
    this.onMenuToggle();
  };
  isBlocked = () => {
    return this.props.story.fields.subtasks.filter(
      (subtask: SubTask) => subtask.fields.status.id === STATUS.blocked
    ).length;
  };
  openCreateSubtaskModal = () =>
    this.setState({ showCreateSubtaskModal: true });
  handleCloseModal = () => this.setState({ showCreateSubtaskModal: false });

  render() {
    const { story, selectedAvatars } = this.props;
    const epicColor =
      (story.fields.epic && story.fields.epic.color.key) || "none";
    return (
      <li className="story" key={story.id}>
        <div
          className={
            "story-menu-toggle" + (this.state.activeMenu ? " open" : "")
          }
          onClick={() => this.onMenuToggle()}
        >
          ...
        </div>
        <ul className={"story-menu" + (this.state.activeMenu ? " open" : "")}>
          <li onClick={() => this.props.transitionStory(STATUS.todo, story.id)}>
            To-do
          </li>
          <li
            onClick={() =>
              this.props.transitionStory(STATUS.inProgress, story.id)
            }
          >
            In Progress
          </li>
          <li onClick={() => this.props.transitionStory(STATUS.done, story.id)}>
            Done
          </li>
          <li onClick={() => this.openCreateSubtaskModal()}>Create Subtask</li>
        </ul>
        <section className="story-summary-section">
          <p onClick={this.handleStoryClick} className="summary">
            {story.fields.summary}
          </p>
          {story.fields.epic && (
            <p className="epic">
              <span className={epicColor + " epic-label"}>
                {story.fields.epic.name}
              </span>
            </p>
          )}
        </section>
        <section className="avatars">
          {Object.keys(story.fields.subtasks).length ? (
            <Avatars
              subtasks={story.fields.subtasks}
              selectedAvatars={selectedAvatars}
            />
          ) : (
            <img
              alt="assignee avatar"
              className="avatar"
              src={
                story.fields.assignee &&
                story.fields.assignee.avatarUrls["32x32"]
              }
            />
          )}
        </section>
        <section className="story-details">
          <span className="issueid">{story.key}</span>
          <img
            className="priority"
            alt="priority icon"
            src={
              story.fields.priority ? story.fields.priority.iconUrl : undefined
            }
          />
          <span className="storypoints">{story.fields.customfield_10016}</span>
        </section>
        {this.state.showCreateSubtaskModal ? (
          <Modal close={this.handleCloseModal}>
            <CreateEditSubTask
              story={this.props.story}
              assignees={this.props.assignees}
              close={this.handleCloseModal}
            />
          </Modal>
        ) : null}
        {this.state.showStoryModal ? (
          <Modal close={this.handleCloseStoryModal}>
            <EditStory story={story} />
          </Modal>
        ) : null}
      </li>
    );
  }
}

export default StoryCard;

// // attempt to get 'click outside to deselect menu' working
// function ClickOutside({ children, onClick }: { children: any; onClick: any }) {
//   const refs = React.Children.map(children, () => React.createRef());
//   const handleClick = (e: any) => {
//     const isOutside = refs.every((ref: any) => {
//       return ref.current && !ref.current.contains(e.target);
//     });
//     if (isOutside) {
//       onClick();
//     }
//   };
//
//   useEffect(() => {
//     document.addEventListener("click", handleClick);
//
//     return function() {
//       document.removeEventListener("click", handleClick);
//     };
//   });
//
//   return React.Children.map(children, (element, idx) =>
//     React.cloneElement(element, { ref: refs[idx] })
//   );
// }
