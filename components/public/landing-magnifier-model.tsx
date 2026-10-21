"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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

function MagnifierMesh() {
  const { scene } = useGLTF(MODEL_PATH);

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

    // Rotate around Z axis so the handle points fixed at the bottom-left (-135 degrees)
    cloned.rotation.set(0, 0, -75 * (Math.PI / 180));
    return cloned;
  }, [scene]);

  return <primitive object={model} position={[0, 0, 0]} />;
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
}

export function LandingMagnifierModel({ portalRadius = 240 }: LandingMagnifierModelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe SSR guard: only render WebGL canvas once mounted on client
  if (!mounted) return null;

  // The inner lens radius in the 3D model is ~1.07.
  // We set targetRadius slightly larger than portalRadius so the 3D metallic rim
  // generously frames the portal and completely conceals any background boundary.
  const targetRadius = Math.max(90, portalRadius + 6);
  const zoom = targetRadius / 1.07;

  // Canvas size dynamically sized so the angled handle never clips on any viewport
  const canvasSize = Math.max(540, Math.round(portalRadius * 3.4));

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
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <StudioLighting />
        <OrthoCameraController zoom={zoom} />
        <Suspense fallback={null}>
          <MagnifierMesh />
        </Suspense>
      </Canvas>
    </div>
  );
}
