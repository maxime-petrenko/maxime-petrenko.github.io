import React from "react";
import "../styles/About.css";
import FadeInSection from "./FadeInSection";
import "../styles/Intro.css";
// import Typist from "react-typist";
import "react-typist/dist/Typist.css";

class About extends React.Component {
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
    const one = (
      <p>

          I’m a <b>research Master’s student in Artificial Intelligence </b> at the <a href="https://www.umontreal.ca/en/">University de Montreal</a>, affiliated with <a href="https://geodes.iro.umontreal.ca/">Geodes</a>. My work focuses on multi-agent systems and alignment for code generation, exploring how large language models can collaborate to produce more reliable, readable, and human-aligned code.

      </p>
    );


    const two = (
      <p>      
        Beyond research, I’m passionate about bringing state-of-the-art AI methods into production environments. I enjoy building end-to-end systems — from data pipelines and model training to deployment and evaluation — that bridge the gap between experimentation and real-world impact.
      </p>

    );

    const three = (
      <p>
        My broader interests include machine learning engineering, software reliability, and applied generative AI. I’m driven by the idea that AI systems should not only be powerful but also trustworthy, efficient, and usable.
      </p>
    );
    
    const four = (
      <p>
        Currently, I’m looking for opportunities where I can apply cutting-edge research in practical settings, collaborate with ambitious teams, and contribute to shaping robust, intelligent systems.
      </p>
    );






    return (
      <div id="about">
        <FadeInSection>
  
          <div className="about-content">
            <div className="about-description">
              {[one]}
              {[two]}
              {[three]}
              {[four]}
            </div>
            <div className="about-image">
              <img alt="Maxime Petrenko" src={"/assets/me.jpeg"} />

            </div>

            
          </div>
        </FadeInSection>
      </div>
    );
  }
}

export default About;
