import React from "react";
import { Canvas } from "react-three-fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import "./Home.css";

function Home() {
  return (
    <div className="home">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default Home;
