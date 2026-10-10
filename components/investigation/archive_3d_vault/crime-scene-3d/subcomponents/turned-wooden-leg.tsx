'use client'

import React from 'react'
import * as THREE from 'three'

// ==========================================
// DETAILED TURNED WOODEN LEG (CHÂN GỖ TIỆN CON TIỆN)
// ==========================================
export function TurnedWoodenLeg({
  position,
  height = 0.44,
  woodTexture,
  woodNormalMap,
  woodRoughnessMap
}: {
  position: [number, number, number]
  height?: number
  woodTexture: THREE.Texture
  woodNormalMap?: THREE.Texture
  woodRoughnessMap?: THREE.Texture
}) {
  return (
    <group position={position}>
      <mesh position={[0, height - 0.04, 0]} castShadow>
        <boxGeometry args={[0.075, 0.08, 0.075]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, height - 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.046, 0.04, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, height - 0.16, 0]} castShadow>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, height - 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.025, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, height - 0.31, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.026, 0.16, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.035, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.032, 0.05, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.005, 0]} castShadow>
        <cylinderGeometry args={[0.044, 0.044, 0.015, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.45}
        />
      </mesh>
    </group>
  )
}
