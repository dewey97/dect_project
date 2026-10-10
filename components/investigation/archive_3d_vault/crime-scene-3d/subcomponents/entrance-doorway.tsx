'use client'

import React from 'react'
import * as THREE from 'three'

// ==========================================
// DOUBLE-LEAF WOODEN ENTRANCE DOORWAY (CỬA CHÍNH MỞ TOANG Ở BÊN TRÁI X = -1.8)
// ==========================================
export function EntranceDoorway({ woodTexture }: { woodTexture: THREE.Texture }) {
  return (
    <group>
      {/* 1. SOLID WOOD DOOR FRAME TẠI X = -1.8 (TỪ X = -2.6 ĐẾN X = -1.0) */}
      <mesh position={[-2.6, 1.18, 3.75]} castShadow>
        <boxGeometry args={[0.08, 2.36, 0.16]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      <mesh position={[-1.0, 1.18, 3.75]} castShadow>
        <boxGeometry args={[0.08, 2.36, 0.16]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      <mesh position={[-1.8, 2.36, 3.75]} castShadow>
        <boxGeometry args={[1.68, 0.08, 0.16]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      <mesh position={[-1.8, 0.02, 3.75]} receiveShadow>
        <boxGeometry args={[1.68, 0.04, 0.20]} />
        <meshStandardMaterial map={woodTexture} roughness={0.35} />
      </mesh>

      {/* 2. LEFT DOOR LEAF (MỞ TOANG ÁP VÁCH BÊN TRÁI) */}
      <group position={[-2.56, 1.16, 3.75]} rotation={[0, -2.15, 0]}>
        <mesh position={[0.36, 0, 0]} castShadow>
          <boxGeometry args={[0.72, 2.24, 0.04]} />
          <meshStandardMaterial map={woodTexture} roughness={0.38} />
        </mesh>
        <mesh position={[0.36, 0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.88, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[0.36, -0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.74, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[0.62, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.032, 0.006, 8, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* 3. RIGHT DOOR LEAF (MỞ TOANG ÁP VÁCH BÊN PHẢI) */}
      <group position={[-1.04, 1.16, 3.75]} rotation={[0, 2.15, 0]}>
        <mesh position={[-0.36, 0, 0]} castShadow>
          <boxGeometry args={[0.72, 2.24, 0.04]} />
          <meshStandardMaterial map={woodTexture} roughness={0.38} />
        </mesh>
        <mesh position={[-0.36, 0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.88, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.36, -0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.74, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.62, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.032, 0.006, 8, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  )
}
