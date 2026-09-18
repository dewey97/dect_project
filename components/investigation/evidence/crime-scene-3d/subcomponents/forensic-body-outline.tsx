'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'

// ==========================================
// FORENSIC BODY CHALK OUTLINE & SCATTERED BLOOD POOL
// (TÁI HIỆN CHÍNH XÁC 100% THEO ẢNH USER GỬI — ĐÃ TÁCH NỀN & XÓA HẾT BIỂN SỐ VÀNG)
// ==========================================
export function ForensicBodyOutlineAndBlood() {
  const decalTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load('/images/cases/case_000/forensic_body_chalk_blood.png')
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [])

  return (
    <group position={[-0.45, 0.008, -1.35]}>
      {/* 1. EXACT USER REFERENCE DECAL (TỶ LỆ 1.72m x 2.10m CHUẨN DÁNG NGƯỜI THẬT, KHÔNG MÉO, KHÔNG BIỂN SỐ) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.72, 2.10]} />
        <meshStandardMaterial
          map={decalTexture}
          transparent={true}
          opacity={0.99}
          roughness={0.25}
          metalness={0.05}
          polygonOffset={true}
          polygonOffsetFactor={-3}
          polygonOffsetUnits={-3}
          depthWrite={false}
        />
      </mesh>

      {/* 2. GLOSSY 3D WET BLOOD PUDDLE ACCENT (LỚP ĐỌNG MÁU ƯỚT BÓNG PHẢN QUANG QUANH ĐẦU) */}
      <mesh position={[0.36, 0.002, -0.68]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.20, 20]} />
        <meshStandardMaterial
          color="#380205"
          roughness={0.05}
          metalness={0.18}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 3. 3D SHARP BLOODY GLASS SHARD (MẢNH THỦY TINH VỠ DÍNH MÁU - VẬT CHỨNG P3) */}
      <group position={[0.48, 0.010, -0.15]} rotation={[0.2, 0.8, -0.1]}>
        <mesh castShadow>
          <coneGeometry args={[0.020, 0.075, 3]} />
          <meshPhysicalMaterial
            color="#7f1d1d"
            roughness={0.12}
            transmission={0.65}
            thickness={0.015}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* 4. 3D TORN SHIRT BUTTON (CÚC ÁO SƠ MI NAM ĐỨT CHỈ RƠI VÃI) */}
      <group position={[-0.12, 0.004, 0.25]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.004, 14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}
