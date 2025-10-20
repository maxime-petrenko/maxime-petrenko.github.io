import React from "react";
import JobList from "./JobList";
import "../styles/Experience.css";
import FadeInSection from "./FadeInSection";

class Projects extends React.Component {
  constructor() {
    super();
    this.state = {
      expanded: true,
      activeKey: "1"
    };
    this.handleSelect = this.handleSelect.bind(this);
  }
  handleSelect(eventKey) {
    this.setState({
      activeKey: eventKey
    });
  }
  render() {
    return (
      <div id="experience">
        <FadeInSection>
          <div className="section-header ">
            <span className="section-title">Projects</span>
          </div>
          <JobList></JobList>
        </FadeInSection>
      </div>
    );
  }
}

export default Projects;