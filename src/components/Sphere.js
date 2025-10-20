import React from "react";
import ReactP5Wrapper from "react-p5-wrapper";


export default function Sphere(
  {size = 480,
  radius,
  segLon = 48,
  segLat = 24,

  

  // rotation
  animate = true,
  angleX = 0.0,
  angleY = 0.0,
  angleZ = 0.0,
  rotSpeedX = 0.0,
  rotSpeedY = 0.006,
  rotSpeedZ = 0.0,

  // visuals
  dotRadius = 2.0,
  dotColor = "#878066ff",
  lineColor = "#9ca3af",
  lineAlphaFront = 80,
  lineAlphaBack = 24,

  // breathing
  breathe = true,
  breatheAmp = 0.08,
  breatheHz = 0.18,
  syncDotPulse = true,

  // spikes
  spikesEnabled = true,
  spikeChance = 0.035,
  spikeMax = 6,
  spikeAmpMin = 0.06,
  spikeAmpMax = 0.18,
  spikeSigma = 0.22,
  spikeLifeMin = 35,
  spikeLifeMax = 90,
  spikeFrontBias = 0.7,

  // NEW: scroll shrink controls
  shrinkOnScroll = false,   // turn on/off
  minScale = 0.35,          // 0..1
  scrollRange = 1200,       // px until minScale reached
  scrollOffset = 0,         // px before shrinking begins

  // NEW: bias towards equator (0..1). 0 = uniform latitudes, 1 = strong equator focus.
  spikeEquatorBias = 0.0,

  // optional from earlier
  flipPoles = false,
}) 

{

    // const [scale, setScale] = useState(1);
    // const ticking = useRef(false);

    // useEffect(() => {
    //     if (!shrinkOnScroll) { setScale(1); return; }
    //     const onScroll = () => {
    //     if (ticking.current) return;
    //     ticking.current = true;
    //     requestAnimationFrame(() => {
    //         const y = Math.max(0, window.scrollY - scrollOffset);
    //         const t = Math.min(Math.max(y / scrollRange, 0), 1);         // 0..1
    //         const eased = t * t * (3 - 2 * t);                           // smoothstep
    //         const s = 1 - (1 - minScale) * eased;                        // 1 -> minScale
    //         setScale(s);
    //         ticking.current = false;
    //     });
    //     };
    //     window.addEventListener("scroll", onScroll, { passive: true });
    //     onScroll(); // init
    //     return () => window.removeEventListener("scroll", onScroll);
    // }, [shrinkOnScroll, minScale, scrollRange, scrollOffset]);


  
    const sketch = (p5) => {
    const S = size;
    const CX = S / 2;
    const CY = S / 2;
    const baseR = radius ?? S * 0.38;

    const U = segLon | 0;
    const V = (segLat | 0) + 1;
    const points = new Array(U * V);
    const idx = (i, j) => ((i + U) % U) * V + (j < 0 ? 0 : j >= V ? V - 1 : j);

    // rotation state
    let ax = angleX, ay = angleY, az = angleZ;
    let doAnimate = animate;
    let sx = rotSpeedX, sy = rotSpeedY, sz = rotSpeedZ;

    // breathing state
    let doBreathe = breathe;
    let amp = breatheAmp;
    let hz = breatheHz;
    let pulseDots = syncDotPulse;

    // spikes state
    let spikes = []; // { phi, theta, lenR, life, maxLife, sigma }
    let useSpikes = spikesEnabled;
    let spChance = spikeChance;
    let spMax = spikeMax;
    let spAmpMin = spikeAmpMin;
    let spAmpMax = spikeAmpMax;
    let spSigma = spikeSigma;
    let spLifeMin = spikeLifeMin;
    let spLifeMax = spikeLifeMax;
    let spFrontBias = spikeFrontBias;
    let spEqBias = spikeEquatorBias;






    // live prop updates
    p5.updateWithProps = (np) => {
      if (typeof np.angleX === "number") ax = np.angleX;
      if (typeof np.angleY === "number") ay = np.angleY;
      if (typeof np.angleZ === "number") az = np.angleZ;
      if (typeof np.animate === "boolean") doAnimate = np.animate;
      if (typeof np.rotSpeedX === "number") sx = np.rotSpeedX;
      if (typeof np.rotSpeedY === "number") sy = np.rotSpeedY;
      if (typeof np.rotSpeedZ === "number") sz = np.rotSpeedZ;

      if (typeof np.breathe === "boolean") doBreathe = np.breathe;
      if (typeof np.breatheAmp === "number") amp = np.breatheAmp;
      if (typeof np.breatheHz === "number") hz = np.breatheHz;
      if (typeof np.syncDotPulse === "boolean") pulseDots = np.syncDotPulse;

      if (typeof np.spikesEnabled === "boolean") useSpikes = np.spikesEnabled;
      if (typeof np.spikeChance === "number") spChance = np.spikeChance;
      if (typeof np.spikeMax === "number") spMax = np.spikeMax;
      if (typeof np.spikeAmpMin === "number") spAmpMin = np.spikeAmpMin;
      if (typeof np.spikeAmpMax === "number") spAmpMax = np.spikeAmpMax;
      if (typeof np.spikeSigma === "number") spSigma = np.spikeSigma;
      if (typeof np.spikeLifeMin === "number") spLifeMin = np.spikeLifeMin;
      if (typeof np.spikeLifeMax === "number") spLifeMax = np.spikeLifeMax;
      if (typeof np.spikeFrontBias === "number") spFrontBias = np.spikeFrontBias;
      if (typeof np.spikeEquatorBias === "number") spEqBias = np.spikeEquatorBias; // NEW
      if (typeof np.flipPoles === "boolean") flipPoles = np.flipPoles;
    };

    const rotX = ([x, y, z], a) => { const c = Math.cos(a), s = Math.sin(a); return [x, y * c - z * s, y * s + z * c]; };
    const rotY = ([x, y, z], a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c + z * s, y, -x * s + z * c]; };
    const rotZ = ([x, y, z], a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c, z]; };
    const project = ([x, y]) => [x, y, 1];

    const LIGHT = norm([0.5, 0.2, 1.0]);
    function norm([x, y, z]) { const m = Math.hypot(x, y, z) || 1; return [x / m, y / m, z / m]; }
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    // NEW: equator-biased latitude sampler via rejection sampling with sin^k weight.
    function sampleThetaEquatorBiased(bias) {
      if (bias <= 0) return p5.random(0, Math.PI);
      // k controls sharpness of equator preference; 0=uniform, higher=stronger bias.
      const k = 2 + 10 * clamp(bias, 0, 1); // tweakable mapping
      for (let tries = 0; tries < 20; tries++) {
        const theta = p5.random(0, Math.PI);
        const w = Math.pow(Math.sin(theta), k); // peaks at θ=π/2
        if (p5.random() < w) return theta;
      }
      return Math.PI / 2; // fallback to equator
    }

    p5.setup = () => {
      p5.createCanvas(S, S);
      p5.pixelDensity(1);
      p5.noFill();
      p5.strokeCap(p5.ROUND);
      p5.strokeJoin(p5.ROUND);
      
    };

    p5.draw = () => {
      p5.clear();
      p5.push();
      p5.translate(CX, CY);

      if (doAnimate) { ax += sx; ay += sy; az += sz; }

      // breathing radius
      const t = p5.millis() / 1000;
      const phase = doBreathe ? Math.sin(2 * Math.PI * hz * t) : 0;
      const R = baseR * (1 + amp * phase);

      // spawn spikes with front + equator bias
      if (useSpikes && spikes.length < spMax && p5.random() < spChance) {
        const phi = p5.random(0, p5.TWO_PI);
        let theta;
        let ok = false, tries = 0;
        while (!ok && tries++ < 12) {
          theta = sampleThetaEquatorBiased(spEqBias); // << central latitude bias
          if (spFrontBias <= 0) {
            ok = true;
          } else {
            const sObj = sphToVec(phi, theta);
            const sView = rotZ(rotY(rotX(sObj, ax), ay), az);
            // prefer front hemisphere; allow occasional back spawns
            ok = (sView[2] >= 0) || (p5.random() > spFrontBias);
          }
        }
        spikes.push({
          phi,
          theta,
          lenR: p5.random(spAmpMin, spAmpMax) * baseR,
          life: 1.0,
          maxLife: p5.random(spLifeMin, spLifeMax),
          sigma: spSigma,
        });
      }

      // decay spikes
      for (let i = spikes.length - 1; i >= 0; i--) {
        const sp = spikes[i];
        sp.life -= 1 / sp.maxLife;
        if (sp.life <= 0) spikes.splice(i, 1);
      }

      // build points
      for (let i = 0; i < U; i++) {
        const phi = (i / U) * p5.TWO_PI;
        for (let j = 0; j < V; j++) {
          const theta = (j / (V - 1)) * Math.PI;
          let x = Math.sin(theta) * Math.cos(phi);
          let y = Math.sin(theta) * Math.sin(phi);
          let z = Math.cos(theta);
          if (flipPoles) z = -z;

          // spike lift (angular Gaussian around spike centers in object space)
          let spikeLift = 0;
          if (useSpikes && spikes.length) {
            const nObj = [x, y, z];
            for (const sp of spikes) {
              const sObj = sphToVec(sp.phi, sp.theta);
              let dot = clamp(nObj[0]*sObj[0] + nObj[1]*sObj[1] + nObj[2]*sObj[2], -1, 1);
              const ang = Math.acos(dot);
              const gauss = Math.exp(-(ang * ang) / (2 * sp.sigma * sp.sigma));
              spikeLift += gauss * sp.lenR * easeOut(sp.life);
            }
          }

          const RR = R + spikeLift;
          let P = [RR * x, RR * y, RR * z];
          P = rotZ(rotY(rotX(P, ax), ay), az);

          const [xp, yp, s] = project(P);
          const nView = norm(P);
          const shade = Math.max(0, nView[0]*LIGHT[0] + nView[1]*LIGHT[1] + nView[2]*LIGHT[2]);
          points[idx(i, j)] = { x: xp, y: yp, z: P[2], s, shade };
        }
      }

      // lines
      drawGridLines((p) => p.z < 0, lineAlphaBack);
      drawGridLines((p) => p.z >= 0, lineAlphaFront);

      // dots
      p5.noStroke();
      for (let k = 0; k < points.length; k++) {
        const { x, y, z, shade } = points[k];
        const base = dotRadius * (1.75 + 0.6 * shade);
        const pulse = pulseDots ? (1 + 0.4 * amp * phase) : 1;
        const sizePx = Math.max(0.5, base * pulse);
        p5.fill(colorWithAlpha(dotColor, z >= 0 ? 240 : 150));
        p5.circle(x, y, sizePx);
      }

      p5.pop();
    };

    function drawGridLines(predicate, alpha) {
      const col = colorWithAlpha(lineColor, alpha);
      p5.stroke(col);
      p5.strokeWeight(1);
      for (let i = 0; i < U; i++) {
        for (let j = 0; j < V; j++) {
          const p = points[idx(i, j)];
          if (!predicate(p)) continue;
          const pnU = points[idx(i + 1, j)];
          const pnV = j + 1 < V ? points[idx(i, j + 1)] : null;
          if (pnU && predicate(pnU)) p5.line(p.x, p.y, pnU.x, pnU.y);
          if (pnV && predicate(pnV)) p5.line(p.x, p.y, pnV.x, pnV.y);
        }
      }
    }

    function sphToVec(phi, theta) {
      const st = Math.sin(theta), ct = Math.cos(theta);
      return [st * Math.cos(phi), st * Math.sin(phi), ct];
    }

    function colorWithAlpha(hex, alpha = 255) {
      if (typeof hex === "string" && hex.startsWith("#")) {
        const c = hex.length === 4
          ? hex.replace(/#/,"").split("").map(ch => ch + ch).join("")
          : hex.replace("#","");
        const r = parseInt(c.slice(0,2), 16);
        const g = parseInt(c.slice(2,4), 16);
        const b = parseInt(c.slice(4,6), 16);
        return p5.color(r, g, b, alpha);
      }
      const col = p5.color(hex);
      col.setAlpha(alpha);
      return col;
    }
  };

  return (
    <div
      id="spinning-sphere-dots"
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
      }}
    >
      <ReactP5Wrapper
        sketch={sketch}
        animate={animate}
        angleX={angleX}
        angleY={angleY}
        angleZ={angleZ}
        rotSpeedX={rotSpeedX}
        rotSpeedY={rotSpeedY}
        rotSpeedZ={rotSpeedZ}
        breathe={breathe}
        breatheAmp={breatheAmp}
        breatheHz={breatheHz}
        syncDotPulse={syncDotPulse}
        spikesEnabled={spikesEnabled}
        spikeChance={spikeChance}
        spikeMax={spikeMax}
        spikeAmpMin={spikeAmpMin}
        spikeAmpMax={spikeAmpMax}
        spikeSigma={spikeSigma}
        spikeLifeMin={spikeLifeMin}
        spikeLifeMax={spikeLifeMax}
        spikeFrontBias={spikeFrontBias}
        spikeEquatorBias={spikeEquatorBias}  // NEW
        flipPoles={flipPoles}
      />
    </div>
  );
}







// class Sphere extends React.Component {
//   constructor() {
//     super();
//     this.state = {
//       expanded: true,
//       activeKey: "1"
//     };
//     this.handleSelect = this.handleSelect.bind(this);
//   }
//   handleSelect(eventKey) {
//     this.setState({
//       activeKey: eventKey
//     });
//   }
//   render() {
//     return (
//       <div
//       style={{
//         minHeight: "100vh",
//         display: "grid",
//         placeItems: "center",
//         background: "#2a2317ff",
//       }}>
//       <SpinningSphereDots
//       size={840}
//       // your sphere props...
//       animate
//       angleX={1.3}
//       rotSpeedY={0.002}
//       breathe
//       spikesEnabled
//       spikeChance={0.1}
//       spikeMax={120}
//       spikeSigma={0.1}
//       spikeEquatorBias={0.9}
//       spikeFrontBias={0.8}
//       // NEW:
//       shrinkOnScroll
//       minScale={0.35}
//       scrollRange={1200}
//       scrollOffset={20}
//     />

//     </div>
//     );
//   }
// }

// export default Sphere;






// let angle;

// const Sketch = p5 => {
//   p5.setup = () => {
//     p5.createCanvas(400, 400, "transparent");
//     angle = p5.PI / 4;
//     p5.stroke(255);
//   };

//   p5.draw = () => {
//     p5.clear();
//     p5.translate(200, p5.height);
//     angle = p5.map(p5.sin(p5.frameCount * 0.01), -1, 1, p5.PI / 2, p5.PI / 16); // vary the angle using sin()
//     branch(100);
//   };

//   function branch(len) {
//     p5.line(0, 0, 0, -len);
//     p5.translate(0, -len);
//     if (len > 4) {
//       p5.push();
//       p5.rotate(angle);
//       branch(len * 0.67);
//       p5.pop();
//       p5.push();
//       p5.rotate(-angle);
//       branch(len * 0.67);
//       p5.pop();
//     }
//   }
// };

// const FractalTree = () => (
//   <div id="fractal-tree">
//     <ReactP5Wrapper sketch={Sketch} />
//   </div>
// );

// export default FractalTree;




