"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

function BrassMaterial({ roughness = 0.48 }: { roughness?: number }) {
  return (
    <meshStandardMaterial
      color="#8b622a"
      metalness={0.82}
      roughness={roughness}
    />
  );
}

function CapsuleBody() {
  return (
    <group position={[0, -0.45, 0]}>
      <RoundedBox args={[2.35, 3.75, 0.76]} radius={0.52} smoothness={8}>
        <BrassMaterial roughness={0.42} />
      </RoundedBox>
      <mesh position={[0, 1.38, 0.02]} scale={[1.01, 0.58, 1]}>
        <sphereGeometry args={[1.16, 48, 24]} />
        <BrassMaterial roughness={0.4} />
      </mesh>
    </group>
  );
}

function ImportedKeyhole({ zoom }: { zoom: number }) {
  const { scene } = useGLTF("/keyhole.glb");
  return (
    <primitive
      object={scene}
      scale={0.38 + zoom * 4.2}
      position={[0, -zoom * 0.42, zoom * 0.12]}
      rotation={[0.03, -0.18, 0]}
    />
  );
}

useGLTF.preload("/keyhole.glb");

function LockFace() {
  return (
    <group position={[0, 1.02, 0.53]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.66, 1.66, 0.28, 64]} />
        <BrassMaterial roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.52, 0.055, 12, 64]} />
        <meshStandardMaterial color="#3b2410" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.44, 0.018, 10, 64]} />
        <meshStandardMaterial
          color="#d6a85c"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      <group position={[0, 0.08, 0.28]} rotation={[0, 0, 0.02]}>
        <mesh>
          <boxGeometry args={[0.38, 1.24, 0.15]} />
          <meshStandardMaterial
            color="#302c27"
            metalness={0.88}
            roughness={0.24}
          />
        </mesh>
        <mesh position={[0, 0.64, 0]}>
          <boxGeometry args={[0.38, 0.28, 0.15]} />
          <meshStandardMaterial
            color="#302c27"
            metalness={0.88}
            roughness={0.24}
          />
        </mesh>
        <mesh position={[0.24, 0.42, 0]}>
          <boxGeometry args={[0.32, 0.2, 0.15]} />
          <meshStandardMaterial
            color="#302c27"
            metalness={0.88}
            roughness={0.24}
          />
        </mesh>
      </group>
    </group>
  );
}

export function LandingKeyholeModel({ zoom = 0 }: { zoom?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0.1, 7.2], fov: 34 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <Environment preset="studio" environmentIntensity={0.8} />
        <directionalLight position={[-4, 5, 6]} intensity={5} color="#ffe8b0" />
        <directionalLight position={[5, 0, 2]} intensity={3} color="#9a6427" />
        <ImportedKeyhole zoom={zoom} />
        <ContactShadows
          position={[0, -2.3, 0]}
          opacity={0.5}
          scale={5}
          blur={2.5}
          far={5}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
