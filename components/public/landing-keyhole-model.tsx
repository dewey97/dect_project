"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ALBEDO = "/images/cases/case_000/euro_cylinder_albedo.png";

// Euro-profile cylinder lock proportions (based on reference photos)
export const PLATE_W = 1.0;
export const PLATE_H = 1.88;
export const PLATE_DEPTH = 0.85; // Deep 3D solid brass barrel providing prominent depth

// Keyway centre inside the cylinder plug (in plate units)
export const SLOT_CX = 0;
export const SLOT_CY = 0.58;

// Euro-cylinder keyway profile with authentic warding notches (tooth on right, shelf on left)
export const SLOT_POINTS: [number, number][] = [
  // Top entrance
  [-0.040, 0.865],
  // Left wall upper notch
  [-0.040, 0.740],
  [-0.015, 0.740],
  [-0.015, 0.690],
  [-0.075, 0.690],
  [-0.075, 0.540],
  [-0.040, 0.540],
  // Left wall lower channel
  [-0.040, 0.300],
  [-0.030, 0.280],
  // Bottom channel
  [0.030, 0.280],
  [0.040, 0.300],
  // Right wall lower channel
  [0.040, 0.520],
  // Right wall inward warding tooth
  [0.015, 0.560],
  [0.065, 0.590],
  // Right wall upper section
  [0.065, 0.865],
];

// Chaikin corner cutting for silky smooth, machined cut edge
export const SLOT_PATH: [number, number][] = (() => {
  const dense: [number, number][] = [];
  for (let i = 0; i < SLOT_POINTS.length; i++) {
    const [x0, y0] = SLOT_POINTS[i];
    const [x1, y1] = SLOT_POINTS[(i + 1) % SLOT_POINTS.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.02));
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
  const R_top = 0.50;
  const Y_top = 0.44;
  const X_side = 0.36;
  const Y_intersect = Y_top - Math.sqrt(R_top * R_top - X_side * X_side);
  const Y_bottom = -0.58;
  const R_bottom = 0.36;

  // Perfectly smooth Euro-cylinder outline
  shape.moveTo(X_side, Y_intersect);
  shape.absarc(
    0,
    Y_top,
    R_top,
    Math.atan2(Y_intersect - Y_top, X_side),
    Math.PI - Math.atan2(Y_intersect - Y_top, X_side),
    false,
  );
  shape.lineTo(-X_side, Y_bottom);
  shape.absarc(0, Y_bottom, R_bottom, Math.PI, 0, false);
  shape.lineTo(X_side, Y_intersect);
  shape.closePath();

  // Euro cylinder keyway hole
  const hole = new THREE.Path();
  SLOT_PATH.forEach(([x, y], i) => {
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  });
  hole.closePath();
  shape.holes.push(hole);

  // Extrude with deep barrel thickness and realistic edge bevels
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: PLATE_DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 36,
  });

  // Remap cap UVs to match euro_cylinder_albedo.png (389 x 705)
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    const x = uv.getX(i);
    const y = uv.getY(i);
    const u = (196.5 + x * 360) / 389;
    const v = (355.5 + y * 360) / 705;
    uv.setXY(i, u, v);
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
    scene.environmentIntensity = 0.95;
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

  const front = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: albedo,
        toneMapped: false,
        alphaTest: 0.25,
      }),
    [albedo],
  );

  // Deep metallic brass for barrel cylinder side walls & keyway tunnel interior
  const side = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#846231",
        metalness: 0.84,
        roughness: 0.36,
        envMapIntensity: 1.4,
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

  // Position keyway center on optical axis, with front face at z=0 and barrel extending back
  return (
    <mesh
      geometry={geometry}
      material={[front, side]}
      position={[-SLOT_CX, -SLOT_CY, -PLATE_DEPTH]}
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
    // Orbit on a sphere around the keyway, then look straight down the tunnel.
    camera.position.set(0, lookY + sin * distance, cos * distance);
    camera.lookAt(0, lookY, 0);
  });
  return null;
}

export const CAMERA_FOV = 30;
export const REST_DISTANCE = 5.6;
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
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[2.4, 3.8, 5]}
        intensity={2.0}
        color="#ffe2b5"
      />
      <directionalLight
        position={[-3.2, -1.8, 3]}
        intensity={0.9}
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
