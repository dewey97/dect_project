'use client'

import React from 'react'
import * as THREE from 'three'

// ==========================================
// DETAILED VINTAGE TEAPOT (ẤM TRÀ GỐM SỨ TRẮNG HOA LAM)
// ==========================================
export function VintageTeapot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 1. Pot Body */}
      <mesh position={[0, 0.052, 0]} castShadow>
        <sphereGeometry args={[0.062, 24, 20]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.18} metalness={0.05} />
      </mesh>
      {/* 2. Foot Ring */}
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.038, 0.042, 0.012, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.25} />
      </mesh>
      {/* 3. Pot Collar / Neck */}
      <mesh position={[0, 0.105, 0]}>
        <cylinderGeometry args={[0.036, 0.038, 0.016, 20]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>
      {/* 4. Lid & Brass Knob */}
      <mesh position={[0, 0.118, 0]}>
        <cylinderGeometry args={[0.033, 0.035, 0.012, 20]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.132, 0]}>
        <sphereGeometry args={[0.010, 14, 10]} />
        <meshStandardMaterial color="#d97706" roughness={0.25} metalness={0.8} />
      </mesh>
      {/* 5. Curved Handle on Left */}
      <mesh position={[-0.065, 0.058, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.038, 0.0075, 10, 24, Math.PI * 1.15]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
      {/* 6. Spout on Right pointing up-right */}
      <mesh position={[0.058, 0.072, 0]} rotation={[0, 0, -0.72]}>
        <cylinderGeometry args={[0.012, 0.022, 0.065, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
    </group>
  )
}

// ==========================================
// VINTAGE ASHTRAY WITH CIGARETTES (GẠT TÀN THỦY TINH SA PA & TÀN THUỐC)
// ==========================================
export function VintageAshtray({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Glass Dish Base */}
      <mesh position={[0, 0.014, 0]} receiveShadow>
        <cylinderGeometry args={[0.055, 0.048, 0.026, 20]} />
        <meshPhysicalMaterial
          color="#99f6e4"
          transmission={0.82}
          opacity={0.7}
          roughness={0.12}
          metalness={0.08}
          transparent
        />
      </mesh>
      {/* Inner Ash Reservoir */}
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[0.042, 0.038, 0.012, 16]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      {/* Cigarette Butt 1 */}
      <mesh position={[0.018, 0.022, 0.008]} rotation={[0.12, 0.65, 0.08]}>
        <cylinderGeometry args={[0.0035, 0.0035, 0.032, 8]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} />
      </mesh>
      {/* Cigarette Butt 2 with burnt tip */}
      <mesh position={[-0.012, 0.020, -0.012]} rotation={[-0.15, -0.85, 0.05]}>
        <cylinderGeometry args={[0.0035, 0.0035, 0.028, 8]} />
        <meshStandardMaterial color="#44403c" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ==========================================
// RẠNG ĐÔNG THERMOS FLASK FALLBACK (PHÍCH NƯỚC RẠNG ĐÔNG HOA CÚC ĐỎ)
// ==========================================
export function RangDongFlask({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.072, 0.32, 24]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.076, 0.076, 0.06, 24]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.038, 0.075, 0.05, 24]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.034, 0.038, 0.035, 18]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.024, 0.021, 0.035, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
    </group>
  )
}
