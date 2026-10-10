'use client'

import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ==========================================
// SWINGING CEILING LAMP & VINTAGE CEILING FAN
// ==========================================
export function CeilingProps() {
  const lampGroupRef = useRef<THREE.Group>(null!)
  const fanGroupRef = useRef<THREE.Group>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (lampGroupRef.current) {
      lampGroupRef.current.rotation.z = Math.sin(t * 1.1) * 0.04
      lampGroupRef.current.rotation.x = Math.cos(t * 0.9) * 0.02
    }
    if (lightRef.current) {
      lightRef.current.intensity = 5.2 + Math.sin(t * 8.5) * 0.35
    }

    if (fanGroupRef.current) {
      fanGroupRef.current.rotation.y += 0.035
    }
  })

  return (
    <group position={[0, 3.4, 0]}>
      {/* 1. SWINGING PENDANT NOIR LAMP (OVER TEA TABLE AT [0, 0, -2.4]) */}
      <group position={[0, 0, -2.4]}>
        <group ref={lampGroupRef}>
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.9, 8]} />
            <meshStandardMaterial color="#111" roughness={0.7} />
          </mesh>

          <mesh position={[0, -0.9, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.38, 0.22, 24, 1, true]} />
            <meshStandardMaterial color="#2d2218" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>

          <mesh position={[0, -0.94, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#fffbeb" emissive="#fde047" emissiveIntensity={3.2} />
          </mesh>

          <pointLight
            ref={lightRef}
            position={[0, -0.98, 0]}
            color="#ffc87a"
            intensity={4.2}
            distance={10}
            decay={2}
          />

          <spotLight
            position={[0, -0.92, 0]}
            target-position={[0, 0, -2.4]}
            color="#ffd699"
            intensity={3.2}
            angle={0.85}
            penumbra={0.4}
            distance={8}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            shadow-bias={-0.0001}
            shadow-radius={1.5}
          />
        </group>
      </group>

      {/* 2. VINTAGE GREEN CEILING FAN */}
      <group position={[0, -0.25, 0.5]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.25, 12]} />
          <meshStandardMaterial color="#1e3a29" metalness={0.8} roughness={0.3} />
        </mesh>
        <group ref={fanGroupRef}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.09, 16]} />
            <meshStandardMaterial color="#234530" metalness={0.7} roughness={0.35} />
          </mesh>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rad, i) => (
            <mesh key={i} rotation={[0.08, rad, 0]} position={[Math.cos(rad) * 0.55, 0, Math.sin(rad) * 0.55]}>
              <boxGeometry args={[0.85, 0.012, 0.14]} />
              <meshStandardMaterial color="#1a3524" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 3. CENTRAL ROOM OVERHEAD LIGHT (HIGH-EFFICIENCY ROOM-WIDE SHADOW CASTER TẠI X = -1.1, Z = 0) */}
      <group position={[-1.1, -0.15, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.03, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
        {/* Soft omnidirectional room fill */}
        <pointLight
          position={[0, 0, 0]}
          color="#fed7aa"
          intensity={2.8}
          distance={12}
          decay={1.8}
        />
        {/* Crisp, ultra-fast 1-pass room-wide directional shadow downlight */}
        <directionalLight
          position={[0, 0, 0]}
          target-position={[0, -3.4, 0]}
          color="#fed7aa"
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.2}
          shadow-camera-far={4.2}
          shadow-camera-left={-4.4}
          shadow-camera-right={4.4}
          shadow-camera-top={4.4}
          shadow-camera-bottom={-4.4}
          shadow-bias={-0.00015}
          shadow-radius={1.5}
        />
      </group>
    </group>
  )
}

// ==========================================
// DUST PARTICLES FLOATING IN AIR (SUBTLE ATMOSPHERIC MOTES)
// ==========================================
export function DustParticles({ count = 60 }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9.5
      pos[i * 3 + 1] = Math.random() * 3.2 + 0.2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7.0
    }
    return pos
  })

  useFrame((state) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array
    const t = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.0015 + 0.0006
      array[i * 3] += Math.cos(t * 0.4 + i) * 0.0006
      if (array[i * 3 + 1] > 3.4) array[i * 3 + 1] = 0.2
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#fed7aa"
        transparent
        opacity={0.18}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
