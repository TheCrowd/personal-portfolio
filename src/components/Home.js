import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import {
  ScrollControls,
  Scroll,
  useScroll,
  Image,
  Preload,
  Text,
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  TrackballControls,
  Html,
  CameraControls,
} from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./Home.css";
import "./cyberpunk-2077.css";
import "./cyberpunk.css";
import { RGBA_ASTC_10x10_Format } from "three";
import ManVanishing from "./ManVanishing";

function Home() {
  return (
    <div className="home">
      <Canvas>
        <Suspense fallback={null}>
          <ScrollControls damping={4} pages={5}>
            <Scroll>
              <Header />
            </Scroll>
            <Scroll>
              <Terminal />
            </Scroll>
            <Scroll>
              <ManVanishing />
            </Scroll>
            <Scroll>
              <Cube />
            </Scroll>
            <Scroll>
              <Cloud radius={7} />
            </Scroll>
            {/* <Scroll>
              <ImageGroup />
            </Scroll> */}
            <Scroll html>
              <h1 className="cyber-h" style={{ top: "130vh" }}>
                Skills
              </h1>
            </Scroll>
          </ScrollControls>
          <Preload />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Home;
function Terminal() {
  return (
    <Html>
      <div className="terminal cyber-tile cyber-glitch">
        <h1 className="cyber-h">About Me</h1>
        {/* <p className="line1">name：章盛鹭 | zhang,sheng-lu</p> */}
        <p className="line2">
          A full stack developer, who is passionate about web development and
          eveything about technology.
        </p>
        <p className="line3">
          Scroll down to know more about me!
          <span className="cursor3">_</span>
        </p>
      </div>
    </Html>
  );
}
function Header() {
  return (
    <Html>
      <div className="header cyber-banner bg-purple">
        <p className="title cyberpunk-font-og">Portfolio</p>
        <div className="github-url">
          <a href="https://github.com/TheCrowd">TheCrowd</a>
          <img src="./fonts/github-mark-white.svg" alt="github" />
        </div>
      </div>
    </Html>
  );
}
// cube with image texture
function Cube() {
  const data = useScroll();
  const mesh = useRef();
  useFrame(() => {
    mesh.current.rotation.x = data.range(0, 1 / 3) * Math.PI + Math.PI * 0.2;
    mesh.current.rotation.y = data.range(0, 1 / 3) * Math.PI + Math.PI * 0.2;
    mesh.current.material.opacity = data.range(0, 1 / 3);
    mesh.current.position.z = data.range(0, 1 / 3) * 10;
  });
  const texture = useLoader(
    THREE.TextureLoader,
    "personal-portfolio/images/matrix.jpg"
  );
  return (
    <mesh ref={mesh} position={[2.5, 0.5, 0]}>
      <boxBufferGeometry attach="geometry" args={[3, 3, 3]} />
      <meshBasicMaterial attach="material" map={texture} />
    </mesh>
  );
}

function Word({ children, ...props }) {
  const color = new THREE.Color();
  const colors = [
    "white",
    "red",
    "blue",
    "green",
    "orange",
    "purple",
    "pink",
    "brown",
    "grey",
    "black",
  ];
  const fontProps = {
    font: "fonts/Inter-Bold.woff",
    fontSize: 0.7,
    letterSpacing: -0.05,
    lineHeight: 1,
    "material-toneMapped": false,
  };
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const over = (e) => (e.stopPropagation(), setHovered(true));
  const out = () => setHovered(false);
  // Change the mouse cursor on hover
  useEffect(() => {
    if (hovered) document.body.style.cursor = "pointer";
    return () => (document.body.style.cursor = "auto");
  }, [hovered]);
  // Tie component to the render-loop
  useFrame(({ camera }) => {
    // Make text face the camera
    ref.current.quaternion.copy(camera.quaternion);
    // Animate font color
    ref.current.material.color.lerp(
      color.set(hovered ? "#fa2720" : "white"),
      0.1
    );
  });
  return (
    <Text
      ref={ref}
      onPointerOver={over}
      onPointerOut={out}
      onClick={() => console.log("clicked")}
      {...props}
      {...fontProps}
      children={children}
      color={new THREE.Color(colors[Math.floor(Math.random() * colors.length)])}
    />
  );
}

function Cloud({ radius = 15 }) {
  const { height, width } = useThree((state) => state.viewport);
  const wordGroup = useRef();
  const data = useScroll();
  const calculatePositionInSphere = (spherical, i, offset = 0) => {
    const phi = Math.PI * (Math.sqrt(5) - 1);
    const theta = phi * i;
    const y = 1 - (i / (count - 1)) * 2;
    const sRadius = Math.sqrt(1 - y * y);
    const x = sRadius * Math.cos(theta);
    const z = sRadius * Math.sin(theta);
    const sPhi = Math.atan2(z, x);
    const sTheta = Math.atan2(y, x);
    const vector = new THREE.Vector3().setFromSpherical(
      spherical.set(radius, sPhi + offset, sTheta + offset)
    );
    vector.setY(vector.y - height * 2.5);
    vector.setZ(vector.z - width / 2);
    return vector;
  };

  useFrame(() => {
    const offset = data.range(0, 1) * Math.PI * 0.4;
    const spherical = new THREE.Spherical();
    for (let i = 0; i < wordGroup.current.children.length; i++) {
      const child = wordGroup.current.children[i];
      const vector = calculatePositionInSphere(spherical, i, offset);
      child.position.copy(vector);
    }
  });
  // Create a count x count random words with spherical distribution
  const WORDS = [
    "Express",
    "Confluence",
    "Ruby",
    "Javascript",
    "AWS",
    "Postgres",
    "Serverless",
    "GraphQL",
    "NodeJS",
    "Typescript",
    "Docker",
    "Pair Programming",
    "Functional Programming",
    "Agile",
    "Scrum",
    "Kanban",
    "TDD",
    "BDD",
    "CI/CD",
    "Git",
    "Github",
    "Gitlab",
    "Jira",
    "React",
    "Slack",
    "Microsoft Teams",
    "VSCode",
    "Vim",
    "Linux",
    "MacOS",
    "Windows",
    "Ubuntu",
    "CloudFormation",
    "CloudWatch",
  ];
  const count = WORDS.length;
  const words = useMemo(() => {
    const temp = [];
    const spherical = new THREE.Spherical();
    for (let i = 0; i < count; i++) {
      temp.push([calculatePositionInSphere(spherical, i), WORDS[i]]);
    }
    return temp;
  }, [radius]);
  return (
    <group ref={wordGroup}>
      {words.map(([pos, word], index) => (
        <Word key={index} position={pos} children={word} />
      ))}
    </group>
  );
}
