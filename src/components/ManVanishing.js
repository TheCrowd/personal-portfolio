import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { generateUUID } from "three/src/math/MathUtils";
import { useHelper } from "@react-three/drei";
import { useFrame } from "react-three-fiber";

export default function ManVanishing() {
  const [maleModel, setMaleModel] = useState();
  const [femaleModel, setFemaleModel] = useState();
  const [meshes, setMeshes] = useState([]);
  const loader = new OBJLoader();
  const clock = new THREE.Clock();

  useFrame(() => {
    let delta = 10 * clock.getDelta();
    delta = delta < 2 ? delta : 2;

    for (let j = 0; j < meshes.length; j++) {
      const data = meshes[j];
      const positions = data.positions;
      const initialPositions = data.initialPositions;

      const count = positions.count;

      if (data.start > 0) {
        data.start -= 1;
      } else {
        if (data.direction === 0) {
          data.direction = -1;
        }
      }

      for (let i = 0; i < count; i++) {
        const px = positions.getX(i);
        const py = positions.getY(i);
        const pz = positions.getZ(i);

        // falling down
        if (data.direction < 0) {
          if (py > 0) {
            positions.setXYZ(
              i,
              px + 1.5 * (0.5 - Math.random()) * data.speed * delta,
              py + 3.0 * (0.25 - Math.random()) * data.speed * delta,
              pz + 1.5 * (0.5 - Math.random()) * data.speed * delta
            );
          } else {
            data.verticesDown += 1;
          }
        }

        // rising up
        if (data.direction > 0) {
          const ix = initialPositions.getX(i);
          const iy = initialPositions.getY(i);
          const iz = initialPositions.getZ(i);

          const dx = Math.abs(px - ix);
          const dy = Math.abs(py - iy);
          const dz = Math.abs(pz - iz);

          const d = dx + dy + dx;

          if (d > 1) {
            positions.setXYZ(
              i,
              px -
                ((px - ix) / dx) * data.speed * delta * (0.85 - Math.random()),
              py - ((py - iy) / dy) * data.speed * delta * (1 + Math.random()),
              pz -
                ((pz - iz) / dz) * data.speed * delta * (0.85 - Math.random())
            );
          } else {
            data.verticesUp += 1;
          }
        }
      }

      // all vertices down
      if (data.verticesDown >= count) {
        if (data.delay <= 0) {
          data.direction = 1;
          data.speed = 5;
          data.verticesDown = 0;
          data.delay = 320;
        } else {
          data.delay -= 1;
        }
      }

      // all vertices up
      if (data.verticesUp >= count) {
        if (data.delay <= 0) {
          data.direction = -1;
          data.speed = 15;
          data.verticesUp = 0;
          data.delay = 120;
        } else {
          data.delay -= 1;
        }
      }

      positions.needsUpdate = true;
    }
  });
  useEffect(() => {
    if (maleModel && femaleModel) return;
    loader.load("personal-portfolio/models/male02.obj", (obj) => {
      setMaleModel(obj);
      const positions = combineBuffer(obj, "position");
      const maleMesh = createMesh(positions, 0.01, -1, 0, 0, 0xff7744);
      setMeshes([...meshes, ...maleMesh]);
    });

    loader.load("personal-portfolio/models/female02.obj", (obj) => {
      setFemaleModel(obj);
      const positions = combineBuffer(obj, "position");
      const femaleMeshes = createMesh(positions, 0.01, -1, 1, 0, 0xff7744);
      setMeshes([...meshes, ...femaleMeshes]);
    });
  }, [maleModel, femaleModel]);
  return <MeshGroup meshGroup={meshes} />;
}

function MeshGroup(props) {
  const group = useRef();
  useFrame(() => {
    group.current.rotation.y += 0.0002;
  });
  const gridGeometry = new THREE.PlaneGeometry(15, 15, 64, 64);
  const gridMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: "purple",
  });
  return (
    <object3D
      ref={group}
      rotation={new THREE.Euler(Math.PI / 4, Math.PI / 8, 0)}
      position={new THREE.Vector3(0.5, 0, -1)}
    >
      {/* <points
        position={new THREE.Vector3(-1, 0, 0)}
        rotation={new THREE.Euler(-Math.PI / 2, 0, 0)}
        geometry={gridGeometry}
        material={gridMaterial}
      ></points> */}
      {props.meshGroup.map((mesh) => {
        const key = generateUUID();
        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute("position", mesh.positions);
        geometry.setAttribute("initialPosition", mesh.positions);
        geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

        const material = new THREE.PointsMaterial({
          size: 0.02,
          color: mesh.color,
        });
        return (
          <points
            key={key}
            position={mesh.position}
            scale={mesh.scale}
            color={mesh.color}
            geometry={geometry}
            material={material}
          ></points>
        );
      })}
    </object3D>
  );
}

function combineBuffer(model, bufferName) {
  let count = 0;

  model.traverse(function (child) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName];

      count += buffer.array.length;
    }
  });

  const combined = new Float32Array(count);

  let offset = 0;

  model.traverse(function (child) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName];

      combined.set(buffer.array, offset);
      offset += buffer.array.length;
    }
  });

  return new THREE.BufferAttribute(combined, 3);
}

function createMesh(positions, scale, x, y, z, color) {
  let mesh;
  let meshGroup = [];
  const clones = [
    [-3, 0, -3],
    [3, 0, 0],
    [3, 0, 3],
    [3, 0, -5],
    [4, 0, 2],
    [-4, 0, 4],
    [-1, 0, -2],
    [-3, 0, 3],
  ];

  const colors = [0xffdd44, 0xffffff, 0xff4422, 0xff9955, 0xff77dd, 0x252525];

  for (let i = 0; i < clones.length; i++) {
    const c = colors[(i + 3) % colors.length];
    mesh = {
      scale: new THREE.Vector3(scale, scale, scale),
      position: new THREE.Vector3(
        clones[i][0] + x,
        clones[i][1] + y,
        clones[i][2] + z
      ),
      color: c,
      positions: positions.clone(),
      initialPositions: positions.clone(),
      direction: 0,
      verticesDown: 0,
      verticesUp: 0,
      speed: 15,
      delay: Math.floor(200 + 200 * Math.random()),
    };
    meshGroup.push(mesh);
  }
  return meshGroup;
}
