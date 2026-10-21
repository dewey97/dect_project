"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ALBEDO = "/images/cases/case_000/keyhole_plate_albedo.webp";

// Plate proportions taken from the reference front render (364 × 690 px crop).
export const PLATE_W = 1;
export const PLATE_H = 1.896;
export const PLATE_DEPTH = 0.15;
// Keyway centre inside the plate, in plate units.
export const SLOT_CX = 0.003;
export const SLOT_CY = 0.55;
// Escutcheon silhouette traced from the reference front render (brass mask
// sampled row by row, then smoothed). Matches the photo exactly, so no
// background pixels from the texture leak around the stem.
export const PLATE_OUTLINE: [number, number][] = [
  [0.073, 0.923],
  [0.158, 0.896],
  [0.221, 0.868],
  [0.265, 0.841],
  [0.301, 0.813],
  [0.331, 0.786],
  [0.357, 0.758],
  [0.379, 0.731],
  [0.399, 0.703],
  [0.415, 0.676],
  [0.429, 0.648],
  [0.441, 0.621],
  [0.451, 0.593],
  [0.459, 0.566],
  [0.466, 0.538],
  [0.471, 0.511],
  [0.474, 0.484],
  [0.475, 0.456],
  [0.475, 0.429],
  [0.474, 0.401],
  [0.471, 0.374],
  [0.466, 0.346],
  [0.46, 0.319],
  [0.452, 0.291],
  [0.443, 0.264],
  [0.431, 0.236],
  [0.417, 0.209],
  [0.4, 0.181],
  [0.381, 0.154],
  [0.362, 0.126],
  [0.357, 0.099],
  [0.357, 0.071],
  [0.357, 0.044],
  [0.357, 0.016],
  [0.354, -0.011],
  [0.354, -0.038],
  [0.354, -0.066],
  [0.354, -0.093],
  [0.354, -0.121],
  [0.354, -0.148],
  [0.354, -0.176],
  [0.352, -0.203],
  [0.352, -0.231],
  [0.352, -0.258],
  [0.352, -0.286],
  [0.352, -0.313],
  [0.352, -0.341],
  [0.352, -0.368],
  [0.35, -0.396],
  [0.349, -0.423],
  [0.349, -0.451],
  [0.349, -0.478],
  [0.349, -0.505],
  [0.349, -0.533],
  [0.349, -0.56],
  [0.348, -0.588],
  [0.346, -0.615],
  [0.345, -0.643],
  [0.339, -0.67],
  [0.333, -0.698],
  [0.324, -0.725],
  [0.313, -0.753],
  [0.297, -0.78],
  [0.278, -0.808],
  [0.255, -0.835],
  [0.225, -0.863],
  [0.186, -0.89],
  [0.128, -0.918],
  [0.06, -0.934],
  [0, -0.94],
  [-0.075, -0.934],
  [-0.143, -0.912],
  [-0.196, -0.885],
  [-0.232, -0.857],
  [-0.26, -0.83],
  [-0.282, -0.802],
  [-0.3, -0.775],
  [-0.313, -0.747],
  [-0.324, -0.72],
  [-0.332, -0.692],
  [-0.338, -0.665],
  [-0.34, -0.637],
  [-0.341, -0.61],
  [-0.343, -0.582],
  [-0.343, -0.555],
  [-0.343, -0.527],
  [-0.346, -0.5],
  [-0.346, -0.473],
  [-0.346, -0.445],
  [-0.346, -0.418],
  [-0.346, -0.39],
  [-0.349, -0.363],
  [-0.349, -0.335],
  [-0.349, -0.308],
  [-0.348, -0.28],
  [-0.348, -0.253],
  [-0.351, -0.225],
  [-0.352, -0.198],
  [-0.351, -0.17],
  [-0.348, -0.143],
  [-0.35, -0.115],
  [-0.351, -0.088],
  [-0.353, -0.06],
  [-0.351, -0.033],
  [-0.354, -0.005],
  [-0.354, 0.022],
  [-0.354, 0.049],
  [-0.354, 0.077],
  [-0.355, 0.104],
  [-0.365, 0.132],
  [-0.387, 0.159],
  [-0.406, 0.187],
  [-0.422, 0.214],
  [-0.435, 0.242],
  [-0.446, 0.269],
  [-0.453, 0.297],
  [-0.462, 0.324],
  [-0.466, 0.352],
  [-0.472, 0.379],
  [-0.476, 0.407],
  [-0.477, 0.434],
  [-0.478, 0.462],
  [-0.475, 0.489],
  [-0.473, 0.516],
  [-0.468, 0.544],
  [-0.462, 0.571],
  [-0.453, 0.599],
  [-0.443, 0.626],
  [-0.432, 0.654],
  [-0.418, 0.681],
  [-0.4, 0.709],
  [-0.381, 0.736],
  [-0.359, 0.764],
  [-0.332, 0.791],
  [-0.302, 0.819],
  [-0.264, 0.846],
  [-0.217, 0.874],
  [-0.004, 0.923],
];

// Keyway cut, traced pixel by pixel from the black opening in the reference
// front render, so the mesh hole matches the photo's keyway exactly.
export const SLOT_POINTS: [number, number][] = [
  [-0.06, 0.832],
  [0.047, 0.832],
  [0.066, 0.821],
  [0.066, 0.799],
  [0.063, 0.783],
  [0.063, 0.684],
  [0.044, 0.651],
  [0, 0.585],
  [0.016, 0.569],
  [0.069, 0.541],
  [0.074, 0.503],
  [0.074, 0.288],
  [0.047, 0.272],
  [0.019, 0.266],
  [-0.014, 0.272],
  [-0.025, 0.283],
  [-0.038, 0.288],
  [-0.041, 0.486],
  [-0.047, 0.503],
  [-0.058, 0.519],
  [-0.066, 0.536],
  [-0.069, 0.552],
  [-0.069, 0.684],
  [-0.008, 0.69],
  [-0.005, 0.706],
  [-0.003, 0.783],
  [-0.058, 0.794],
  [-0.06, 0.816],
];

// Tracing a photo leaves a one-pixel staircase on every edge. Densify, then
// run Chaikin corner cutting so the keyway reads as a machined cut up close
// while the traced silhouette stays where the photo has it.
export const SLOT_PATH: [number, number][] = (() => {
  const dense: [number, number][] = [];
  for (let i = 0; i < SLOT_POINTS.length; i++) {
    const [x0, y0] = SLOT_POINTS[i];
    const [x1, y1] = SLOT_POINTS[(i + 1) % SLOT_POINTS.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.012));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      dense.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
    }
  }
  let pts = dense;
  for (let pass = 0; pass < 2; pass++) {
    const next: [number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      next.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25]);
      next.push([x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]);
    }
    pts = next;
  }
  return pts;
})();

function buildGeometry() {
  const shape = new THREE.Shape();
  const [first, ...rest] = PLATE_OUTLINE;
  shape.moveTo(first[0], first[1]);
  shape.splineThru(rest.map(([x, y]) => new THREE.Vector2(x, y)));
  shape.closePath();

  const hole = new THREE.Path();
  SLOT_PATH.forEach(([x, y], i) => {
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  });
  hole.closePath();
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: PLATE_DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
    curveSegments: 40,
  });
  // ExtrudeGeometry cap UVs are raw plate coordinates; remap to 0..1 so the
  // reference photo lines up with the silhouette exactly.
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) / PLATE_W + 0.5, uv.getY(i) / PLATE_H + 0.5);
  }
  uv.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.8;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Plate() {
  const [albedo] = useTexture([ALBEDO]);
  const geometry = useMemo(buildGeometry, []);

  useEffect(() => {
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.anisotropy = 8;
    albedo.wrapS = albedo.wrapT = THREE.ClampToEdgeWrapping;
    albedo.needsUpdate = true;
  }, [albedo]);

  // The reference render already carries its baked lighting — showing the
  // photo unlit keeps every scratch and highlight exactly like the model and
  // avoids specular blowout washing out the plate.
  const front = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: albedo,
        toneMapped: false,
        // The albedo carries an alpha cut-out of the real escutcheon, so any
        // sliver where the traced contour runs slightly wide stays invisible
        // instead of leaking the studio backdrop.
        alphaTest: 0.5,
      }),
    [albedo],
  );
  const side = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3f2f1b",
        metalness: 0.55,
        roughness: 0.7,
        envMapIntensity: 0.22,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      front.dispose();
      side.dispose();
    },
    [geometry, front, side],
  );

  // Centre the keyway on the camera axis.
  return (
    <mesh
      geometry={geometry}
      material={[front, side]}
      position={[-SLOT_CX, -SLOT_CY, 0]}
    />
  );
}

function CameraRig({
  distance,
  pitch,
  lookY,
}: {
  distance: number;
  pitch: number;
  lookY: number;
}) {
  useFrame((state) => {
    const { camera } = state;
    const sin = Math.sin(pitch);
    const cos = Math.cos(pitch);
    // Orbit on a sphere around the keyway, then look straight at it.
    camera.position.set(0, lookY + sin * distance, cos * distance);
    camera.lookAt(0, lookY, 0);
  });
  return null;
}

export const CAMERA_FOV = 30;
export const REST_DISTANCE = 5;
export const END_DISTANCE = 0.155;
export const PITCH_REST = 0.85;

export function LandingKeyholeModel({
  distance,
  pitch,
  lookY,
  opacity = 1,
}: {
  distance: number;
  pitch: number;
  lookY: number;
  opacity?: number;
}) {
  return (
    <Canvas
      className="absolute inset-0 z-20"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{
        position: [
          0,
          Math.sin(PITCH_REST) * REST_DISTANCE,
          Math.cos(PITCH_REST) * REST_DISTANCE,
        ],
        fov: CAMERA_FOV,
        near: 0.01,
        far: 40,
      }}
      style={{ background: "transparent", opacity }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2.4, 3.6, 5]}
        intensity={1.8}
        color="#ffd7a1"
      />
      <directionalLight
        position={[-3.2, -1.2, 3]}
        intensity={0.7}
        color="#a9c7ff"
      />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <Plate />
      </Suspense>
      <CameraRig distance={distance} pitch={pitch} lookY={lookY} />
    </Canvas>
  );
}
