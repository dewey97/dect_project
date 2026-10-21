"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ALBEDO = "/images/cases/case_000/euro_cylinder_albedo_clean.png";
const BRASS_TEXTURE = "/images/cases/case_000/brass_seamless.png";
const BRASS_NORMAL = "/images/cases/case_000/brass_normal.png";

// Euro-profile cylinder lock proportions (based on reference photos)
export const PLATE_W = 1.0;
export const PLATE_H = 1.88;
export const PLATE_DEPTH = 0.34; // Authentic realistic Euro-cylinder depth (matches reference lock barrel)
const BEVEL_THICKNESS = 0.015;
const BEVEL_SIZE = 0.010;

// Keyway centre inside the cylinder plug (in plate units)
export const SLOT_CX = -0.018;
export const SLOT_CY = 0.572;

// Euro-cylinder keyway profile precisely matching reference photo (media_1792595925558_1d95ed3c.png):
// - Prominent left warding shelf with horizontal underside
// - Iconic triangular wedge warding tooth on the right
// - Clean vertical lower keyway channel with flat floor
export const SLOT_POINTS: [number, number][] = [
  // Top entrance
  [-0.080, 0.865],
  [-0.080, 0.805],
  // Left warding shelf (pointing right)
  [-0.108, 0.795],
  [-0.015, 0.735],
  [-0.015, 0.708],
  [-0.082, 0.705],
  // Left wall channel
  [-0.082, 0.535],
  [-0.054, 0.490],
  [-0.054, 0.280],
  // Bottom channel
  [0.072, 0.280],
  // Right wall channel & triangular wedge tooth (pointing left)
  [0.072, 0.510],
  [-0.010, 0.590],
  [0.062, 0.672],
  // Right wall upper section
  [0.070, 0.865],
];

// Chaikin corner cutting for silky smooth, machined cut edge
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
  for (let pass = 0; pass < 1; pass++) {
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

// Bounding box of the keyway opening, used to isolate tunnel wall vertices
// (so the ambient-occlusion gradient never darkens the outer barrel walls).
export const KEYWAY_BOUNDS = (() => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of SLOT_PATH) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const margin = 0.04; // covers the beveled lip of the opening
  return {
    minX: minX - margin,
    maxX: maxX + margin,
    minY: minY - margin,
    maxY: maxY + margin,
  };
})();

function buildGeometry() {
  const shape = new THREE.Shape();
  const R_top = 0.5;
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
    bevelThickness: BEVEL_THICKNESS,
    bevelSize: BEVEL_SIZE,
    bevelSegments: 4,
    curveSegments: 36,
    // Subdivide the side walls along the barrel so the baked tunnel occlusion
    // can fall off smoothly instead of as one linear smear front→back.
    steps: 10,
  });

  // Remap UVs:
  // Front cap vertices map to euro_cylinder_albedo_clean.png
  // Outer barrel and bevel vertices map to seamless brass scratch texture
  // Inner keyway bore vertices map to seamless brass scratch texture
  geometry.computeVertexNormals();
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const norm = geometry.attributes.normal as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const nz = norm.getZ(i);
    const nx = Math.abs(norm.getX(i));
    const ny = Math.abs(norm.getY(i));

    if (z > 0.15 && nz > 0.55) {
      // Front cap face
      const u = (196.5 + x * 360) / 389;
      const v = (355.5 + y * 360) / 705;
      uv.setXY(i, u, v);
    } else if (
      x > KEYWAY_BOUNDS.minX &&
      x < KEYWAY_BOUNDS.maxX &&
      y > KEYWAY_BOUNDS.minY &&
      y < KEYWAY_BOUNDS.maxY
    ) {
      // Keyway inner bore: fine textured brass tunnel walls
      const u = nx > ny ? y * 3.5 : x * 3.5;
      const v = z * 4.5;
      uv.setXY(i, u, v);
    } else {
      // Outer cylinder barrel and bevels: cylindrical wrap around top barrel, linear on flats
      let u = 0;
      if (y > 0.2) {
        const angle = Math.atan2(y - 0.44, x);
        u = (angle / Math.PI + 1) * 2.2;
      } else {
        u = nx > ny ? y * 2.6 : x * 2.6;
      }
      const v = z * 4.0;
      uv.setXY(i, u, v);
    }
  }
  uv.needsUpdate = true;

  // Baked ambient occlusion inside the keyway tunnel: the walls catch the
  // studio light at the entrance lip and fall off into the dark bore.
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox!;
  const zSpan = Math.max(0.0001, bb.max.z - bb.min.z);
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    let shade = 1;
    if (
      x > KEYWAY_BOUNDS.minX &&
      x < KEYWAY_BOUNDS.maxX &&
      y > KEYWAY_BOUNDS.minY &&
      y < KEYWAY_BOUNDS.maxY
    ) {
      // z = 1 at the front lip (bright) → 0 at the back of the barrel (dark).
      // Smooth falloff: lip catches key light, bore darkens naturally into depth
      const t = THREE.MathUtils.clamp((z - bb.min.z) / zSpan, 0, 1);
      shade = 0.2 + 0.8 * Math.pow(t, 2.0);
    }
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = shade;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // ExtrudeGeometry only exposes two material slots (caps / all side walls).
  // Split the side walls so the keyway bore gets its own darker, rougher
  // material instead of mirror-polished brass, which read as chrome.
  const sideGroup = geometry.groups.find((g) => g.materialIndex === 1);
  const capGroup = geometry.groups.find((g) => g.materialIndex === 0);
  if (!sideGroup || !capGroup) return geometry;

  const capIndices: number[] = [];
  for (let i = 0; i < capGroup.count; i++) capIndices.push(capGroup.start + i);

  const outerIndices: number[] = [];
  const boreIndices: number[] = [];
  const end = sideGroup.start + sideGroup.count;
  for (let i = sideGroup.start; i < end; i += 3) {
    let cx = 0;
    let cy = 0;
    for (let v = 0; v < 3; v++) {
      cx += pos.getX(i + v) / 3;
      cy += pos.getY(i + v) / 3;
    }
    if (
      cx > KEYWAY_BOUNDS.minX &&
      cx < KEYWAY_BOUNDS.maxX &&
      cy > KEYWAY_BOUNDS.minY &&
      cy < KEYWAY_BOUNDS.maxY
    ) {
      boreIndices.push(i, i + 1, i + 2);
    } else {
      outerIndices.push(i, i + 1, i + 2);
    }
  }

  const split = new THREE.BufferGeometry();
  split.setAttribute("position", pos.clone());
  split.setAttribute("normal", geometry.attributes.normal.clone());
  split.setAttribute("uv", uv.clone());
  split.setAttribute("color", geometry.attributes.color.clone());
  split.setIndex([...capIndices, ...outerIndices, ...boreIndices]);
  split.addGroup(0, capIndices.length, 0);
  split.addGroup(capIndices.length, outerIndices.length, 1);
  split.addGroup(
    capIndices.length + outerIndices.length,
    boreIndices.length,
    2,
  );
  split.computeBoundingSphere();
  geometry.dispose();
  return split;
}

function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.85;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Plate() {
  const [albedo, brassTexture, brassNormal] = useTexture([
    ALBEDO,
    BRASS_TEXTURE,
    BRASS_NORMAL,
  ]);
  const geometry = useMemo(buildGeometry, []);

  useEffect(() => {
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.anisotropy = 8;
    albedo.wrapS = albedo.wrapT = THREE.ClampToEdgeWrapping;
    albedo.needsUpdate = true;

    brassTexture.colorSpace = THREE.SRGBColorSpace;
    brassTexture.anisotropy = 8;
    brassTexture.wrapS = brassTexture.wrapT = THREE.RepeatWrapping;
    brassTexture.needsUpdate = true;

    brassNormal.colorSpace = THREE.NoColorSpace;
    brassNormal.anisotropy = 8;
    brassNormal.wrapS = brassNormal.wrapT = THREE.RepeatWrapping;
    brassNormal.needsUpdate = true;
  }, [albedo, brassTexture, brassNormal]);

  // Aged brass face: crisp photo texture lit with metallic roughness and authentic scratches
  const front = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: albedo,
        normalMap: brassNormal,
        normalScale: new THREE.Vector2(0.6, 0.6),
        color: "#ffffff",
        metalness: 0.8,
        roughness: 0.44,
        envMapIntensity: 0.95,
      }),
    [albedo, brassNormal],
  );

  // Machined brass barrel wall & bevels with authentic micro-scratches
  const side = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: brassTexture,
        normalMap: brassNormal,
        normalScale: new THREE.Vector2(0.75, 0.75),
        color: "#f5dfba",
        metalness: 0.82,
        roughness: 0.42,
        envMapIntensity: 0.95,
      }),
    [brassTexture, brassNormal],
  );

  // Keyway bore: warm shadowed brass with directional lighting & depth occlusion
  const bore = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: brassTexture,
        normalMap: brassNormal,
        normalScale: new THREE.Vector2(0.55, 0.55),
        color: "#dfc79e",
        metalness: 0.65,
        roughness: 0.55,
        envMapIntensity: 0.5,
        vertexColors: true,
      }),
    [brassTexture, brassNormal],
  );

  // Machined seam where the cylinder plug meets the housing cap
  const seamGeometry = useMemo(
    () => new THREE.TorusGeometry(0.458, 0.0035, 6, 120),
    [],
  );
  const seamMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#281e12",
        metalness: 0.8,
        roughness: 0.7,
        envMapIntensity: 0.5,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      seamGeometry.dispose();
      front.dispose();
      side.dispose();
      bore.dispose();
      seamMaterial.dispose();
    },
    [geometry, seamGeometry, front, side, bore, seamMaterial],
  );

  // Position keyway center on optical axis, with front face at z=0 and barrel extending back.
  return (
    <group position={[-SLOT_CX, -SLOT_CY, -PLATE_DEPTH]}>
      <mesh geometry={geometry} material={[front, side, bore]} />
      <mesh
        geometry={seamGeometry}
        material={seamMaterial}
        position={[0, 0.44, PLATE_DEPTH + BEVEL_THICKNESS + 0.001]}
      />
    </group>
  );
}

function CameraRig({
  distance,
  pitch = 0,
  lookY = 0,
  mouseX = 0,
  mouseY = 0,
}: {
  distance: number;
  pitch?: number;
  lookY?: number;
  mouseX?: number;
  mouseY?: number;
  zoomProgress?: number;
}) {
  const curX = useRef(0);
  const curY = useRef(0);

  useFrame((state, delta) => {
    const { camera } = state;
    // Attenuate mouse parallax as camera approaches and enters keyhole
    const weight = Math.max(0, Math.min(1, (distance - 0.15) / 1.2));

    // Smooth lerp for silky damped physics (frame-rate independent)
    const t = 1 - Math.exp(-delta * 9);
    curX.current = THREE.MathUtils.lerp(curX.current, mouseX * weight, t);
    curY.current = THREE.MathUtils.lerp(curY.current, mouseY * weight, t);

    // Wide amplitude 3D orbit & lateral parallax based on mouse
    const yaw = curX.current * 0.44; // +/- 25 degrees left/right
    const pitchOffset = -curY.current * 0.32; // +/- 18 degrees up/down

    const totalPitch = pitch + pitchOffset;
    const sinP = Math.sin(totalPitch);
    const cosP = Math.cos(totalPitch);
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);

    // Camera travels deeply along Z: positive outside lock, negative inside keyway tunnel
    const camX = sinY * Math.max(0.08, distance) + curX.current * 0.16 * weight;
    const camY = lookY + sinP * Math.max(0.08, distance) - curY.current * 0.12 * weight;
    const camZ = distance * cosY * cosP;

    camera.position.set(camX, camY, camZ);
    // Always look ahead down the Z axis into the room
    camera.lookAt(0, lookY, camZ - 5.0);
  });
  return null;
}

export const CAMERA_FOV = 30;
export const REST_DISTANCE = 5.2;
export const END_DISTANCE = -0.38;
export const PITCH_REST = 0;

export function LandingKeyholeModel({
  distance,
  pitch = 0,
  lookY = 0,
  opacity = 1,
  mouseX = 0,
  mouseY = 0,
  zoomProgress = 0,
}: {
  distance: number;
  pitch?: number;
  lookY?: number;
  opacity?: number;
  mouseX?: number;
  mouseY?: number;
  zoomProgress?: number;
}) {
  return (
    <Canvas
      className="absolute inset-0 z-20 pointer-events-none"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{
        position: [0, 0, REST_DISTANCE],
        fov: CAMERA_FOV,
        near: 0.005,
        far: 40,
      }}
      style={{ background: "transparent", opacity }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3.0, 4.2, 5.0]}
        intensity={1.8}
        color="#fff0db"
      />
      <directionalLight
        position={[-3.5, -2.0, 3.5]}
        intensity={0.65}
        color="#d0ddf5"
      />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <Plate />
      </Suspense>
      <CameraRig
        distance={distance}
        pitch={pitch}
        lookY={lookY}
        mouseX={mouseX}
        mouseY={mouseY}
        zoomProgress={zoomProgress}
      />
    </Canvas>
  );
}
