import React from "react";
import Experience from "./components/Experience";
import Experience_ref from "./components/Experience_ref";
import About from "./components/About";
import Credits from "./components/Credits";
import NavBar from "./components/NavBar";
import "./App.css";
import "./styles/Global.css";
import "rsuite/dist/styles/rsuite-default.css";
import Sphere from "./components/Sphere";

function App() {
  return (
    <div className="App">
      <NavBar></NavBar>
      <div id="content">



        <About></About>
        <Experience></Experience>
   
        
        <div style={{
              minHeight: "100vh",
              display: "grid",
              placeItems: "center",
              marginTop: "250px",
            }}>
          <Sphere
            size={840}
            animate
            angleX={1.3}
            rotSpeedY={0.002}
            breathe
            spikesEnabled
            spikeChance={0.1}
            spikeMax={120}
            spikeSigma={0.1}
            spikeEquatorBias={0.9}
            spikeFrontBias={0.8}
            shrinkOnScroll
            minScale={0.35}
            scrollRange={1200}
            scrollOffset={20}
          />
        </div>



        <Credits></Credits>
      </div>
    </div>
  );
}

export default App;
