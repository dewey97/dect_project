'use client'

import React, { Suspense } from 'react'
import * as THREE from 'three'
import { TurnedWoodenLeg } from './turned-wooden-leg'
import { VintageTeapot, VintageAshtray, RangDongFlask } from './vintage-props'
import { AutoScaledGLB } from './auto-scaled-glb'

// ==========================================
// AUTHENTIC VIETNAMESE WOODEN LIVING SET (TRƯỜNG KỶ & BÀN TRÀ 1996)
// ==========================================
export function VietnameseLivingRoomSet({
  woodTexture,
  woodNormalMap,
  woodRoughnessMap
}: {
  woodTexture: THREE.Texture
  woodNormalMap?: THREE.Texture
  woodRoughnessMap?: THREE.Texture
}) {
  return (
    <group position={[0, 0, -2.4]}>
      {/* ========================================================================= */}
      {/* 1. ARTISAN TEA TABLE (BÀN TRÀ GỖ ĐỤC CHẠM 1.50m x 0.72m x 0.48m) */}
      {/* ========================================================================= */}
      <group position={[0, 0, 0]}>
        {/* Main Tabletop with Framed Bevel */}
        <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.50, 0.035, 0.72]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.25}
            metalness={0.06}
          />
        </mesh>
        {/* Inset polished tabletop center panel */}
        <mesh position={[0, 0.488, 0]} receiveShadow>
          <boxGeometry args={[1.34, 0.005, 0.56]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.4, 0.4)}
            roughnessMap={woodRoughnessMap}
            roughness={0.20}
            metalness={0.08}
          />
        </mesh>

        {/* 4 Apron Skirts (Yếm bàn 4 mặt bao quanh dưới mặt bàn) */}
        <mesh position={[0, 0.42, 0.31]} castShadow>
          <boxGeometry args={[1.36, 0.07, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.42, -0.31]} castShadow>
          <boxGeometry args={[1.36, 0.07, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[-0.67, 0.42, 0]} castShadow>
          <boxGeometry args={[0.025, 0.07, 0.58]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[0.67, 0.42, 0]} castShadow>
          <boxGeometry args={[0.025, 0.07, 0.58]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>

        {/* 4 Corner Turned Legs (4 chân bàn tiện lộc bình) */}
        {[
          [-0.66, 0, -0.28],
          [0.66, 0, -0.28],
          [-0.66, 0, 0.28],
          [0.66, 0, 0.28]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`tbl-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.46}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}

        {/* Lower Slat Shelf (Giá nan để đồ dưới gầm bàn trà) */}
        <group position={[0, 0.12, 0]}>
          {/* Side stretchers */}
          <mesh position={[0, 0, 0.27]}>
            <boxGeometry args={[1.34, 0.025, 0.03]} />
            <meshStandardMaterial map={woodTexture} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.27]}>
            <boxGeometry args={[1.34, 0.025, 0.03]} />
            <meshStandardMaterial map={woodTexture} roughness={0.4} />
          </mesh>
          {/* 9 wooden slats */}
          {[-0.54, -0.40, -0.27, -0.13, 0, 0.13, 0.27, 0.40, 0.54].map((sx, si) => (
            <mesh key={`slat-${si}`} position={[sx, 0.015, 0]}>
              <boxGeometry args={[0.03, 0.012, 0.52]} />
              <meshStandardMaterial map={woodTexture} roughness={0.45} />
            </mesh>
          ))}
          {/* Điếu cày nứa bọc đồng đặt trên giá nan dưới bàn */}
          <group position={[0.1, 0.05, 0.05]} rotation={[0.05, 0.25, 1.52]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.022, 0.024, 0.62, 16]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.05, 16]} />
              <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, -0.28, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.05, 16]} />
              <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0.03, 0.12, 0]} rotation={[0, 0, -0.45]}>
              <cylinderGeometry args={[0.008, 0.012, 0.09, 12]} />
              <meshStandardMaterial color="#92400e" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Tea Tray with Tea Set (Khay trà gỗ hương & bộ ấm chén Bát Tràng) */}
        <group position={[-0.15, 0.49, 0.02]}>
          {/* Wooden Tea Tray with raised lip */}
          <mesh position={[0, 0.008, 0]} receiveShadow>
            <boxGeometry args={[0.46, 0.016, 0.32]} />
            <meshStandardMaterial map={woodTexture} roughness={0.35} />
          </mesh>
          {/* Raised Brass/Wood Tray Rim */}
          <mesh position={[0, 0.018, 0.155]}>
            <boxGeometry args={[0.46, 0.012, 0.012]} />
            <meshStandardMaterial color="#30160b" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.018, -0.155]}>
            <boxGeometry args={[0.46, 0.012, 0.012]} />
            <meshStandardMaterial color="#30160b" roughness={0.4} />
          </mesh>
          <mesh position={[0.225, 0.018, 0]}>
            <boxGeometry args={[0.012, 0.012, 0.30]} />
            <meshStandardMaterial color="#30160b" roughness={0.4} />
          </mesh>
          <mesh position={[-0.225, 0.018, 0]}>
            <boxGeometry args={[0.012, 0.012, 0.30]} />
            <meshStandardMaterial color="#30160b" roughness={0.4} />
          </mesh>

          {/* Teapot in Center-Right of Tray */}
          <VintageTeapot position={[0.06, 0.016, -0.02]} />

          {/* 4 Porcelain Teacups with Tea Liquid */}
          {[
            [-0.11, 0.016, -0.08],
            [-0.11, 0.016, 0.06],
            [-0.01, 0.016, 0.08]
          ].map((cPos, ci) => (
            <group key={`cup-${ci}`} position={cPos as [number, number, number]}>
              <mesh position={[0, 0.018, 0]} castShadow>
                <cylinderGeometry args={[0.024, 0.016, 0.036, 16]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} />
              </mesh>
              {/* Tea Liquid */}
              <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.020, 14]} />
                <meshStandardMaterial color="#d97706" roughness={0.1} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Hot Water Thermos Flask (Phích Rạng Đông hoa cúc đỏ) */}
        <Suspense fallback={<RangDongFlask position={[0.48, 0.49, -0.12]} />}>
          <AutoScaledGLB
            url="/models/case_000/phich-nuoc__hot_water_flask.glb"
            targetDimensions={[0.16, 0.42, 0.16]}
            position={[0.48, 0.49, -0.12]}
            rotation={[0, -0.4, 0]}
          />
        </Suspense>

        {/* Vintage Sa Pa Crystal Ashtray */}
        <VintageAshtray position={[0.26, 0.49, 0.12]} />
      </group>

      {/* ========================================================================= */}
      {/* CRIME SCENE EVIDENCE ON FLOOR: SHATTERED TEACUP & BLOOD SHARD */}
      {/* ========================================================================= */}
      <group position={[-0.45, 0.005, 0.55]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.26, 16]} />
          <meshStandardMaterial color="#3f0708" roughness={0.88} />
        </mesh>
        <mesh position={[-0.06, 0.01, -0.04]} rotation={[0.4, 0.8, -0.2]} castShadow>
          <boxGeometry args={[0.06, 0.008, 0.04]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.01, 0.02]} rotation={[-0.2, 0.5, 0.6]} castShadow>
          <boxGeometry args={[0.05, 0.006, 0.03]} />
          <meshStandardMaterial color="#eedfd5" roughness={0.3} />
        </mesh>
        <mesh position={[0.16, 0.02, -0.12]} rotation={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.06, 0.04, 0.003]} />
          <meshStandardMaterial color="#facc15" roughness={0.4} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 2. LONG BENCH (TRƯỜNG KỶ LIỀN KHỐI CHẮC CHẮN: 1.96m x 0.60m x 0.90m) */}
      {/* ========================================================================= */}
      <group position={[0, 0, -0.92]}>
        {/* Seat Board (Mặt ghế trường kỷ) */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.96, 0.035, 0.58]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.28}
            metalness={0.05}
          />
        </mesh>

        {/* Seat Apron Skirt (Yếm ghế bao quanh dưới mặt ngồi) */}
        <mesh position={[0, 0.37, 0.26]} castShadow>
          <boxGeometry args={[1.80, 0.06, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.37, -0.26]} castShadow>
          <boxGeometry args={[1.80, 0.06, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[-0.91, 0.37, 0]} castShadow>
          <boxGeometry args={[0.025, 0.06, 0.48]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[0.91, 0.37, 0]} castShadow>
          <boxGeometry args={[0.025, 0.06, 0.48]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>

        {/* 4 Turned Bench Legs (4 chân trường kỷ) */}
        {[
          [-0.88, 0, -0.22],
          [0.88, 0, -0.22],
          [-0.88, 0, 0.22],
          [0.88, 0, 0.22]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`bench-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.42}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}

        {/* SOLID AUTHENTIC BACKREST (TỰA LƯNG TRƯỜNG KỶ LIỀN KHUNG HOÀN CHỈNH) */}
        <group position={[0, 0, -0.26]}>
          {/* Bottom rail resting firmly on seat */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.96, 0.045, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>

          {/* Top crowning rail */}
          <mesh position={[0, 0.88, 0]} castShadow>
            <boxGeometry args={[2.00, 0.065, 0.05]} />
            <meshStandardMaterial map={woodTexture} roughness={0.34} />
          </mesh>

          {/* 2 Outer corner stiles connecting bottom to top rail */}
          <mesh position={[-0.94, 0.665, 0]} castShadow>
            <boxGeometry args={[0.06, 0.41, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>
          <mesh position={[0.94, 0.665, 0]} castShadow>
            <boxGeometry args={[0.06, 0.41, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>

          {/* 2 Intermediate divider stiles (2 đố đứng chia 3 lô) */}
          <mesh position={[-0.31, 0.665, 0]} castShadow>
            <boxGeometry args={[0.045, 0.41, 0.04]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
          <mesh position={[0.31, 0.665, 0]} castShadow>
            <boxGeometry args={[0.045, 0.41, 0.04]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>

          {/* 3 Seamless Inset Carved Wood Panels (3 lô đục chạm phẳng mịn) */}
          {[-0.625, 0, 0.625].map((bx, bi) => (
            <mesh key={`b-pan-${bi}`} position={[bx, 0.665, 0]} castShadow>
              <boxGeometry args={[0.56, 0.38, 0.025]} />
              <meshStandardMaterial
                map={woodTexture}
                normalMap={woodNormalMap}
                roughnessMap={woodRoughnessMap}
                roughness={0.38}
              />
            </mesh>
          ))}
        </group>

        {/* 2 SIDE ARMRESTS (2 TAY VỊN TRƯỜNG KỶ HAI ĐẦU) */}
        {/* Left Armrest */}
        <group position={[-0.94, 0, 0]}>
          <mesh position={[0, 0.64, 0]} castShadow>
            <boxGeometry args={[0.055, 0.045, 0.54]} />
            <meshStandardMaterial map={woodTexture} roughness={0.35} />
          </mesh>
          {/* Front support post */}
          <mesh position={[0, 0.53, 0.24]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.18, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
          {/* Middle spindle */}
          <mesh position={[0, 0.53, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.18, 10]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
        </group>

        {/* Right Armrest */}
        <group position={[0.94, 0, 0]}>
          <mesh position={[0, 0.64, 0]} castShadow>
            <boxGeometry args={[0.055, 0.045, 0.54]} />
            <meshStandardMaterial map={woodTexture} roughness={0.35} />
          </mesh>
          {/* Front support post */}
          <mesh position={[0, 0.53, 0.24]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.18, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
          {/* Middle spindle */}
          <mesh position={[0, 0.53, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.18, 10]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 3. UPRIGHT ARMCHAIR 1 (GHẾ ĐƠN 1 ĐỨNG: 0.72m x 0.60m x 0.90m) */}
      {/* ========================================================================= */}
      <group position={[1.25, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Seat */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.035, 0.58]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
        {/* Seat Apron */}
        <mesh position={[0, 0.37, 0.26]} castShadow>
          <boxGeometry args={[0.60, 0.06, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.37, -0.26]} castShadow>
          <boxGeometry args={[0.60, 0.06, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>

        {/* 4 Turned Legs */}
        {[
          [-0.29, 0, -0.22],
          [0.29, 0, -0.22],
          [-0.29, 0, 0.22],
          [0.29, 0, 0.22]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`ch1-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.42}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}

        {/* Solid Backrest */}
        <group position={[0, 0, -0.26]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.72, 0.045, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.88, 0]} castShadow>
            <boxGeometry args={[0.76, 0.065, 0.05]} />
            <meshStandardMaterial map={woodTexture} roughness={0.34} />
          </mesh>
          <mesh position={[-0.32, 0.665, 0]} castShadow>
            <boxGeometry args={[0.055, 0.41, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>
          <mesh position={[0.32, 0.665, 0]} castShadow>
            <boxGeometry args={[0.055, 0.41, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.665, 0]} castShadow>
            <boxGeometry args={[0.56, 0.38, 0.025]} />
            <meshStandardMaterial
              map={woodTexture}
              normalMap={woodNormalMap}
              roughnessMap={woodRoughnessMap}
              roughness={0.38}
            />
          </mesh>
        </group>

        {/* 2 Armrests */}
        <group position={[-0.32, 0, 0]}>
          <mesh position={[0, 0.64, 0]} castShadow>
            <boxGeometry args={[0.05, 0.045, 0.54]} />
            <meshStandardMaterial map={woodTexture} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.53, 0.24]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
        </group>
        <group position={[0.32, 0, 0]}>
          <mesh position={[0, 0.64, 0]} castShadow>
            <boxGeometry args={[0.05, 0.045, 0.54]} />
            <meshStandardMaterial map={woodTexture} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.53, 0.24]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 4. OVERTURNED ARMCHAIR 2 (GHẾ ĐƠN 2 BỊ XÔ NGÃ LẬT TRONG LÚC GIẰNG CO) */}
      {/* ========================================================================= */}
      <group position={[-1.25, 0.20, 0.1]} rotation={[0.4, 0.2, 1.4]}>
        {/* Seat */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.035, 0.58]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
        {/* Seat Apron */}
        <mesh position={[0, 0.37, 0.26]} castShadow>
          <boxGeometry args={[0.60, 0.06, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.37, -0.26]} castShadow>
          <boxGeometry args={[0.60, 0.06, 0.025]} />
          <meshStandardMaterial map={woodTexture} roughness={0.35} />
        </mesh>

        {/* 4 Turned Legs */}
        {[
          [-0.29, 0, -0.22],
          [0.29, 0, -0.22],
          [-0.29, 0, 0.22],
          [0.29, 0, 0.22]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`ch2-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.42}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}

        {/* Solid Backrest */}
        <group position={[0, 0, -0.26]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.72, 0.045, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.88, 0]} castShadow>
            <boxGeometry args={[0.76, 0.065, 0.05]} />
            <meshStandardMaterial map={woodTexture} roughness={0.34} />
          </mesh>
          <mesh position={[-0.32, 0.665, 0]} castShadow>
            <boxGeometry args={[0.055, 0.41, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>
          <mesh position={[0.32, 0.665, 0]} castShadow>
            <boxGeometry args={[0.055, 0.41, 0.045]} />
            <meshStandardMaterial map={woodTexture} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.665, 0]} castShadow>
            <boxGeometry args={[0.56, 0.38, 0.025]} />
            <meshStandardMaterial
              map={woodTexture}
              normalMap={woodNormalMap}
              roughnessMap={woodRoughnessMap}
              roughness={0.38}
            />
          </mesh>
        </group>

        {/* 2 Armrests */}
        <group position={[-0.32, 0, 0]}>
          <mesh position={[0, 0.64, 0]} castShadow>
            <boxGeometry args={[0.05, 0.045, 0.54]} />
            <meshStandardMaterial map={woodTexture} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.53, 0.24]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
        </group>
        <group position={[0.32, 0, 0]}>
          <mesh position={[0, 0.64, 0]} castShadow>
            <boxGeometry args={[0.05, 0.045, 0.54]} />
            <meshStandardMaterial map={woodTexture} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.53, 0.24]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
