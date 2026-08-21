'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VolumetricLightBeamShader } from './volumetric-light-shader'

export function SwingingCeilingLamp() {
  const pendulumRef = useRef<THREE.Group>(null!)
  const spotLightRef = useRef<THREE.SpotLight>(null!)
  const targetObjRef = useRef<THREE.Object3D>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Chuyển động con lắc đơn vật lý (Pendulum arc swing angle)
    const angleZ = Math.sin(t * 1.3) * 0.45 // Góc lắc trái-phải (~25 độ)
    const angleX = Math.cos(t * 1.1) * 0.1  // Nhấp nhô trước-sau nhẹ

    if (pendulumRef.current) {
      pendulumRef.current.rotation.z = angleZ
      pendulumRef.current.rotation.x = angleX
    }

    if (spotLightRef.current) {
      // Đèn nhấp nháy dòng điện sợi đốt mượt mà
      spotLightRef.current.intensity = 6.2 + Math.sin(t * 5.5) * 0.6
    }
  })

  return (
    // Mốc cố định trần nhà (Pivot point at top ceiling)
    <group position={[0, 6.8, 3.8]}>
      {/* Khung quay con lắc đơn vật lý */}
      <group ref={pendulumRef}>
        {/* 1. DÂY TREO ĐÈN ĐEN (PENDULUM WIRE) */}
        <mesh position={[0, -1.6, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 3.2, 12]} />
          <meshStandardMaterial color="#09090b" roughness={0.5} />
        </mesh>

        {/* 2. CHAO ĐÈN KIM LOẠI CỔ ĐIỂN (METAL LAMP SHADE) */}
        <mesh position={[0, -3.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.6, 0.45, 32]} />
          <meshStandardMaterial color="#18181b" metalness={0.92} roughness={0.15} />
        </mesh>

        {/* 3. BÓNG ĐÈN SỢI ĐỐT VÀNG KIM (GLOWING BULB) */}
        <mesh position={[0, -3.4, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={4.0} />
        </mesh>

        {/* 4. LUỒNG NÓN ÁNH ĐÈN 3D VOLUMETRIC GRADIENT FADE TỎA TỪ VÒM CHAO ĐÈN (TRUNCATED CONE) */}
        <mesh position={[0, -7.5, 0]}>
          <cylinderGeometry args={[0.65, 4.6, 8.2, 32, 1, true]} />
          <shaderMaterial
            args={[VolumetricLightBeamShader]}
            transparent={true}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -7.5, 0]}>
          <cylinderGeometry args={[0.32, 2.5, 8.2, 32, 1, true]} />
          <shaderMaterial
            args={[{
              uniforms: {
                uColor: { value: new THREE.Color('#f59e0b') },
                uMaxOpacity: { value: 0.38 },
              },
              vertexShader: VolumetricLightBeamShader.vertexShader,
              fragmentShader: VolumetricLightBeamShader.fragmentShader,
            }]}
            transparent={true}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* 5. TARGET CHIẾU ĐÈN NẰM TRONG CỤM CON LẮC */}
        <object3D ref={targetObjRef} position={[0, -12, 0]} />

        {/* 6. SPOTLIGHT THỰC TẾ CHIẾU MẶT TỦ */}
        {targetObjRef.current && (
          <spotLight
            ref={spotLightRef}
            target={targetObjRef.current}
            position={[0, -3.4, 0]}
            angle={0.88}
            penumbra={0.5}
            intensity={6.2}
            color="#fbbf24"
            distance={30}
          />
        )}
      </group>
    </group>
  )
}
