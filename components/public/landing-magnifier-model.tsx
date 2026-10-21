"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODEL_PATH = "/magnifier.glb";

// Preload model on the client to avoid lag when scrolling into view
if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_PATH);
}

function StudioLighting() {
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

  return (
    <>
      <ambientLight intensity={0.75} />
      {/* Warm key light for brass rim bevel highlights */}
      <directionalLight
        position={[3.5, 4.2, 5.5]}
        intensity={2.2}
        color="#ffeacc"
      />
      {/* Cool specular fill light */}
      <directionalLight
        position={[-4, -3, 4.5]}
        intensity={1.1}
        color="#d1e3ff"
      />
      {/* Warm rim accent on handle grip & pommel */}
      <directionalLight
        position={[-3, -5, 4]}
        intensity={1.6}
        color="#fbbf24"
      />
    </>
  );
}

function MagnifierMesh({ mouseX = 0, mouseY = 0 }: { mouseX?: number; mouseY?: number }) {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const curX = useRef(0);
  const curY = useRef(0);

  const model = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Object_8 / Material.004 is the inner glass disk.
        // We hide it so the crime scene panorama & keyhole behind show through with 100% clarity.
        const matName = Array.isArray(mesh.material)
          ? mesh.material[0]?.name
          : mesh.material?.name;
        if (mesh.name === "Object_8" || matName === "Material.004") {
          mesh.visible = false;
        } else {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });

    // Rotate around Z axis so the handle points fixed at the bottom-left (-75 degrees)
    cloned.rotation.set(0, 0, -75 * (Math.PI / 180));
    return cloned;
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = 1 - Math.exp(-delta * 8);
    curX.current = THREE.MathUtils.lerp(curX.current, mouseX, t);
    curY.current = THREE.MathUtils.lerp(curY.current, mouseY, t);

    // Dynamic 3D tilt & parallax responding to mouse
    groupRef.current.rotation.y = curX.current * 0.22;
    groupRef.current.rotation.x = -curY.current * 0.16;
    groupRef.current.position.x = curX.current * 0.04;
    groupRef.current.position.y = -curY.current * 0.03;
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} position={[0, 0, 0]} />
    </group>
  );
}

function OrthoCameraController({ zoom }: { zoom: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
  }, [camera, zoom]);

  return null;
}

export interface LandingMagnifierModelProps {
  portalRadius?: number;
  mouseX?: number;
  mouseY?: number;
}

export function LandingMagnifierModel({
  portalRadius = 260,
  mouseX = 0,
  mouseY = 0,
}: LandingMagnifierModelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe SSR guard: only render WebGL canvas once mounted on client
  if (!mounted) return null;

  // Exact 3D world-space measurements of magnifier.glb circular rim:
  // - Inner lens opening: 0.7713 world units
  // - Outer bezel edge: 0.8048 world units
  // Using 0.778 as reference radius ensures:
  // - The outer bezel (0.8048 / 0.778 = 1.034 × portalRadius) extends ~9px OUTSIDE the portal
  // - The inner opening (0.7713 / 0.778 = 0.991 × portalRadius) sits ~2px INSIDE the portal
  // Result: The metallic bezel completely sandwiches and conceals the circular portal's boundary,
  // making the magnifying glass rim fit snugly and seamlessly with zero black edge peeking out.
  const RIM_REFERENCE_RADIUS = 0.778;
  const targetRadius = Math.max(90, portalRadius);
  const zoom = targetRadius / RIM_REFERENCE_RADIUS;

  // Canvas size dynamically sized so the angled handle (~2.5× radius) never clips
  const canvasSize = Math.max(600, Math.round(targetRadius * 5.4));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-30"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${canvasSize}px`,
        height: `${canvasSize}px`,
        filter: "drop-shadow(-12px 22px 30px rgba(0,0,0,0.88))",
      }}
    >
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 20],
          zoom: zoom,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <StudioLighting />
        <OrthoCameraController zoom={zoom} />
        <Suspense fallback={null}>
          <MagnifierMesh mouseX={mouseX} mouseY={mouseY} />
        </Suspense>
      </Canvas>
    </div>
  );
}
