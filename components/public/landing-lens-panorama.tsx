"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface LandingLensPanoramaProps {
  src: string;
  /** Target horizontal view angle in degrees (any value; wraps naturally). */
  lon: number;
  /** Target vertical view angle in degrees, clamped to ±60. */
  lat: number;
  /** Camera field of view in degrees. */
  fov: number;
}

function PanoramaSphere({ src }: { src: string }) {
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Flip the geometry (not the mesh) so faces point inward without a mirrored image.
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(50, 64, 40);
    g.scale(-1, 1, 1);
    return g;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function LookController({
  lon,
  lat,
  fov,
}: Omit<LandingLensPanoramaProps, "src">) {
  const cur = useRef({ lon, lat, fov });
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const t = 1 - Math.exp(-delta * 4);
    const c = cur.current;
    c.lon += (lon - c.lon) * t;
    c.lat += (Math.max(-60, Math.min(60, lat)) - c.lat) * t;
    c.fov += (fov - c.fov) * t;

    const phi = THREE.MathUtils.degToRad(90 - c.lat);
    const theta = THREE.MathUtils.degToRad(c.lon);
    target.set(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    );
    camera.lookAt(target);

    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - c.fov) > 0.01) {
      cam.fov = c.fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

/** Lightweight equirectangular 360° view, steered by props (mouse-driven by the parent). */
export function LandingLensPanorama({
  src,
  lon,
  lat,
  fov,
}: LandingLensPanoramaProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0], fov, near: 0.1, far: 200 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <PanoramaSphere src={src} />
      </Suspense>
      <LookController lon={lon} lat={lat} fov={fov} />
    </Canvas>
  );
}
