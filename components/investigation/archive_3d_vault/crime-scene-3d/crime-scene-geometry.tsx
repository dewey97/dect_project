'use client'

import React, { useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { RoomHotspot } from './types'
import { WALL_PICTURE_FRAMES } from './constants'
import { useProceduralTextures } from './hooks/use-procedural-textures'
import { AutoScaledGLB } from './subcomponents/auto-scaled-glb'
import { VietnameseLivingRoomSet } from './subcomponents/living-room-set'
import { EntranceDoorway } from './subcomponents/entrance-doorway'
import { WallPictureFrame } from './subcomponents/wall-picture-frame'
import { OutdoorCourtyardGarden } from './subcomponents/outdoor-courtyard'
import { RoomHotspotPins } from './subcomponents/room-hotspot-pins'
import { ForensicBodyOutlineAndBlood } from './subcomponents/forensic-body-outline'
import {
  VintageGlassDisplayCabinet,
  VintageTelephoneCabinet,
  WindowSillPlantBench
} from './subcomponents/east-wall-cabinets'

// ==========================================
// 3D ARCHITECTURAL ROOM GEOMETRY & PROPS
// ==========================================
export function CrimeSceneGeometry({
  onSelectSpot,
  activeSpotId
}: {
  onSelectSpot: (spot: RoomHotspot) => void
  activeSpotId?: string | null
}) {
  const {
    floorTexture,
    floorBumpMap,
    floorRoughnessMap,
    createWallMaterial,
    woodTexture,
    woodNormalMap,
    woodRoughnessMap,
    baseboardWood,
    beamWood,
    nightWindowTexture,
    courtyardTexture,
    stoneTexture,
    barkTexture,
    skyBackdropTexture
  } = useProceduralTextures()

  // Cement wall materials with accurately scaled plaster repeats (Room 7.8m x 7.5m)
  const matWallNorth = useMemo(() => createWallMaterial(7.8, 3.4), [createWallMaterial])
  const matWallWest = useMemo(() => createWallMaterial(7.5, 3.4), [createWallMaterial])
  // South Wall: Left Segment (2.4m), Lintel above door (1.6m), Right Segment behind TV (3.8m)
  const matWallSouthLeft = useMemo(() => createWallMaterial(2.4, 3.4), [createWallMaterial])
  const matWallSouthLintel = useMemo(() => createWallMaterial(1.6, 1.04), [createWallMaterial])
  const matWallSouthRight = useMemo(() => createWallMaterial(3.8, 3.4), [createWallMaterial])
  // East Wall: North of window (3.45m), South of window (2.45m), Sill (1.6m), Lintel (1.6m)
  const matWallEastNorth = useMemo(() => createWallMaterial(3.45, 3.4), [createWallMaterial])
  const matWallEastSouth = useMemo(() => createWallMaterial(2.45, 3.4), [createWallMaterial])
  const matWallEastSill = useMemo(() => createWallMaterial(1.60, 0.85), [createWallMaterial])
  const matWallEastLintel = useMemo(() => createWallMaterial(1.60, 0.85), [createWallMaterial])

  return (
    <group>
      {/* 1. FLOOR (7.8m x 7.5m, X in [-5.0, 2.8]) — 100% CONTIGUOUS SEAMLESS ENCAUSTIC TILES */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.1, 0, 0]} receiveShadow>
        <planeGeometry args={[7.8, 7.5]} />
        <meshStandardMaterial
          map={floorTexture}
          bumpMap={floorBumpMap}
          bumpScale={0.018}
          roughnessMap={floorRoughnessMap}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* 2. CEILING (7.8m x 7.5m, Y = 3.4m) WITH WOODEN CROSS BEAMS */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-1.1, 3.4, 0]}>
        <planeGeometry args={[7.8, 7.5]} />
        <meshStandardMaterial color="#2d2218" roughness={0.9} />
      </mesh>
      {[-3.6, -2.0, -0.4, 1.2].map((x) => (
        <mesh key={x} position={[x, 3.32, 0]}>
          <boxGeometry args={[0.20, 0.16, 7.54]} />
          <meshStandardMaterial map={beamWood} roughness={0.7} />
        </mesh>
      ))}

      {/* 3. WALL NORTH (Z = -3.75, 7.8m x 3.4m, DÀY 15cm XI MĂNG ĐẶC) */}
      <mesh position={[-1.1, 1.7, -3.75 - 0.075]} material={matWallNorth} receiveShadow>
        <boxGeometry args={[7.8, 3.4, 0.15]} />
      </mesh>

      {/* WALL PICTURE FRAMES */}
      {WALL_PICTURE_FRAMES.map((f) => (
        <WallPictureFrame
          key={f.id}
          label={f.label}
          subtitle={f.subtitle}
          imageUrl={f.imageUrl}
          position={f.position}
          width={f.width}
          height={f.height}
          tilt={f.tilt}
          woodTexture={woodTexture}
        />
      ))}

      {/* MECHANICAL WALL CLOCK (ĐỒNG HỒ CƠ QUẢ LẮC) */}
      <group position={[-2.8, 2.35, -3.71]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.72, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.12, 0.045]}>
          <circleGeometry args={[0.13, 24]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.16, 0.043]}>
          <boxGeometry args={[0.015, 0.22, 0.01]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. WALL SOUTH (Z = +3.75, CỬA CHÍNH TẠI X = -1.8, TƯỜNG XI MĂNG ĐẶC DÀY 15cm) */}
      {/* 4A. Left Segment (X = -5.0 to -2.6, width = 2.4m, center X = -3.8) */}
      <mesh position={[-3.8, 1.7, 3.75 + 0.075]} material={matWallSouthLeft} receiveShadow>
        <boxGeometry args={[2.4, 3.4, 0.15]} />
      </mesh>
      {/* 4B. Lintel above door (X = -2.6 to -1.0, width = 1.6m, center X = -1.8, Y = 2.88) */}
      <mesh position={[-1.8, 2.88, 3.75 + 0.075]} material={matWallSouthLintel} receiveShadow>
        <boxGeometry args={[1.6, 1.04, 0.15]} />
      </mesh>
      {/* 4C. Right Segment behind TV (X = -1.0 to +2.8, width = 3.8m, center X = 0.9) - TƯỜNG ĐẶC PHÍA SAU TỦ TIVI */}
      <mesh position={[0.9, 1.7, 3.75 + 0.075]} material={matWallSouthRight} receiveShadow>
        <boxGeometry args={[3.8, 3.4, 0.15]} />
      </mesh>

      {/* OUTDOOR COURTYARD GARDEN (SÂN VƯỜN NGOÀI CỬA CHÍNH TẠI X = -1.8) */}
      <OutdoorCourtyardGarden
        courtyardTexture={courtyardTexture}
        stoneTexture={stoneTexture}
        barkTexture={barkTexture}
        woodTexture={woodTexture}
        skyBackdropTexture={skyBackdropTexture}
      />

      {/* ENTRANCE DOORWAY (CỬA CHÍNH 2 CÁNH GỖ MỞ TOANG TẠI X = -1.8) */}
      <EntranceDoorway woodTexture={woodTexture} />

      {/* 5. WALL EAST (X = +2.8, THU HẸP DIỆN TÍCH PHÒNG, CÓ TRỔ Ô CỬA SỔ TẠI Z = 0.5) */}
      {/* 5A. North-East Segment (Z = -3.75 to -0.3, length = 3.45m, center Z = -2.025) */}
      <mesh position={[2.8 + 0.075, 1.7, -2.025]} material={matWallEastNorth} receiveShadow>
        <boxGeometry args={[0.15, 3.4, 3.45]} />
      </mesh>
      {/* 5B. South-East Segment (Z = 1.3 to 3.75, length = 2.45m, center Z = 2.525) */}
      <mesh position={[2.8 + 0.075, 1.7, 2.525]} material={matWallEastSouth} receiveShadow>
        <boxGeometry args={[0.15, 3.4, 2.45]} />
      </mesh>
      {/* 5C. Sill Wall Below Window (Z = -0.3 to 1.3, height = 0.85m, center Y = 0.425) */}
      <mesh position={[2.8 + 0.075, 0.425, 0.5]} material={matWallEastSill} receiveShadow>
        <boxGeometry args={[0.15, 0.85, 1.6]} />
      </mesh>
      {/* 5D. Lintel Wall Above Window (Z = -0.3 to 1.3, height = 0.85m, center Y = 2.975) */}
      <mesh position={[2.8 + 0.075, 2.975, 0.5]} material={matWallEastLintel} receiveShadow>
        <boxGeometry args={[0.15, 0.85, 1.6]} />
      </mesh>

      {/* EAST WINDOW (X = 2.8, Z = 0.5) — KHUNG CỬA GỖ, CHẤN SONG GỖ THÔNG THOÁNG & BẦU TRỜI ĐÊM KHÔNG MƯA */}
      <group position={[2.8, 1.70, 0.5]}>
        {/* Khung bao cửa sổ gỗ lim 4 cạnh */}
        <mesh position={[0, 0.81, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.08, 1.64]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.81, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.08, 1.68]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.76]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 1.60, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.76]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 1.60, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>
        {/* Thanh đố chia giữa */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.05, 1.48]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>

        {/* Chấn song cửa sổ gỗ dọc cổ điển (7 song gỗ đứng cách nhau 18cm, nhìn xuyên qua được) */}
        {[-0.54, -0.36, -0.18, 0, 0.18, 0.36, 0.54].map((zOffset, idx) => (
          <mesh key={`window-bar-${idx}`} position={[0, 0, zOffset]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 1.54, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.4} />
          </mesh>
        ))}

        {/* 2 Cánh cửa gỗ mở hé góc 50 độ ra phía ngoài */}
        <group position={[0.12, 0, -0.74]} rotation={[0, 0.85, 0]}>
          <mesh position={[0, 0, 0.35]} castShadow>
            <boxGeometry args={[0.035, 1.50, 0.70]} />
            <meshStandardMaterial map={woodTexture} roughness={0.5} />
          </mesh>
        </group>
        <group position={[0.12, 0, 0.74]} rotation={[0, -0.85, 0]}>
          <mesh position={[0, 0, -0.35]} castShadow>
            <boxGeometry args={[0.035, 1.50, 0.70]} />
            <meshStandardMaterial map={woodTexture} roughness={0.5} />
          </mesh>
        </group>

        {/* Khung cảnh vườn & đường sắt tàu hỏa chạy qua đêm ngoài cửa sổ (16:9 chuẩn nét) */}
        <mesh rotation={[0, -Math.PI / 2, 0]} position={[0.42, 0.02, 0]}>
          <planeGeometry args={[3.2, 1.80]} />
          <meshBasicMaterial map={nightWindowTexture} toneMapped={false} />
        </mesh>

        {/* Ánh sáng vàng rực từ đèn pha tàu hỏa vừa ló ra ở góc phải rọi vào phòng */}
        <pointLight
          position={[0.38, 0.20, 0.45]}
          color="#fde047"
          intensity={1.6}
          distance={4.0}
          decay={2}
        />

        {/* Ánh sáng đỏ từ cột đèn tín hiệu đường sắt Ga Giáp Bát ở góc trái */}
        <pointLight
          position={[0.38, 0.40, -0.65]}
          color="#ef4444"
          intensity={0.8}
          distance={2.5}
          decay={2}
        />
      </group>

      {/* Ánh sáng trời âm u rọi xiên qua cửa sổ Đông vào phòng */}
      <directionalLight
        position={[4.8, 3.2, 0.5]}
        target-position={[1.0, 0.8, 0.5]}
        color="#94a3b8"
        intensity={0.65}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
        shadow-camera-left={-3.0}
        shadow-camera-right={3.0}
        shadow-camera-top={3.0}
        shadow-camera-bottom={-3.0}
        shadow-bias={-0.0001}
        shadow-radius={1.5}
      />

      {/* 5E. VINTAGE GLASS DISPLAY CABINET ALONG EAST WALL NORTH OF WINDOW (TỦ BÚP-PHÊ KÍNH) */}
      <VintageGlassDisplayCabinet
        woodTexture={woodTexture}
        woodNormalMap={woodNormalMap}
        woodRoughnessMap={woodRoughnessMap}
      />

      {/* 5F. LOW PLANT STAND BENCH UNDER WINDOW SILL (KỆ HOA CÂY CẢNH DƯỚI BẬC CỬA SỔ) */}
      <WindowSillPlantBench woodTexture={woodTexture} />

      {/* 5G. VINTAGE TELEPHONE & DIRECTORY SIDEBOARD SOUTH OF WINDOW (TỦ GỖ ĐỂ ĐIỆN THOẠI BÀN) */}
      <VintageTelephoneCabinet
        woodTexture={woodTexture}
        woodNormalMap={woodNormalMap}
        woodRoughnessMap={woodRoughnessMap}
      />

      {/* 6. WALL WEST (X = -5.0, 7.5m x 3.4m, DÀY 15cm XI MĂNG ĐẶC) */}
      <mesh position={[-5.0 - 0.075, 1.7, 0]} material={matWallWest} receiveShadow>
        <boxGeometry args={[0.15, 3.4, 7.5]} />
      </mesh>

      {/* Vintage Wall Calendar on West Wall */}
      <group position={[-4.97, 1.8, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.62, 0.02]} />
          <meshStandardMaterial color="#991b1b" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.06, 0.012]}>
          <planeGeometry args={[0.34, 0.42]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
      </group>

      {/* 7. WOODEN BASEBOARDS (LEN CHÂN TƯỜNG GỖ) */}
      <mesh position={[-1.1, 0.08, -3.72]}>
        <boxGeometry args={[7.8, 0.16, 0.05]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[-3.8, 0.08, 3.72]}>
        <boxGeometry args={[2.4, 0.16, 0.05]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[0.9, 0.08, 3.72]}>
        <boxGeometry args={[3.8, 0.16, 0.05]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[2.77, 0.08, 0]}>
        <boxGeometry args={[0.05, 0.16, 7.5]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[-4.97, 0.08, 0]}>
        <boxGeometry args={[0.05, 0.16, 7.5]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>

      {/* 8. AUTHENTIC VIETNAMESE WOODEN LIVING SET (TRƯỜNG KỶ & BÀN TRÀ TẠI X = 0, Z = -2.4) */}
      <VietnameseLivingRoomSet
        woodTexture={woodTexture}
        woodNormalMap={woodNormalMap}
        woodRoughnessMap={woodRoughnessMap}
      />

      {/* 8A. FORENSIC BODY CHALK OUTLINE & SCATTERED BLOOD POOL (KHOANH VÙNG THI THỂ & VŨNG MÁU) */}
      <ForensicBodyOutlineAndBlood />

      {/* 8B. VINTAGE BEDROOM SET (GÓC TÂY-BẮC) */}
      <group position={[-3.7, 0, -2.45]}>
        <Suspense
          fallback={
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.9, 0.9, 2.3]} />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/bedroom_bed_clean.glb"
            preRotation={[-Math.PI / 2, 0, 0]}
            targetDimensions={[1.90, 1.10, 2.30]}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
          />
        </Suspense>

        {/* Pillow on the Bed with Love Spell Detail (Bùa yêu của Hà giấu trong gối) */}
        <group position={[0.28, 0.54, -0.65]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.14, 0.38]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0.075, 0.02]} rotation={[-Math.PI / 2, 0, 0.4]}>
            <circleGeometry args={[0.04, 3]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          <mesh position={[0.08, 0.076, 0.02]}>
            <cylinderGeometry args={[0.003, 0.003, 0.08, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* 9. VINTAGE LIM WARDROBE (GÓC TÂY-NAM: TỦ GỖ LIM 1996) */}
      <group position={[-3.8, 0, 3.0]}>
        <Suspense
          fallback={
            <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.45, 2.2, 0.75]} />
              <meshStandardMaterial map={woodTexture} roughness={0.45} />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/medieval_wardrobe.glb"
            targetDimensions={[1.45, 2.20, 0.75]}
            position={[0, 0, 0]}
            rotation={[0, Math.PI, 0]}
          />
        </Suspense>
        <mesh position={[0.05, 1.15, -0.40]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.02, 0.14, 0.02]} />
          <meshStandardMaterial color="#78350f" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* 9B. WOODEN TV CREDENZA & 90s CRT TELEVISION & TABLE FAN (ĐỐI DIỆN TRỰC DIỆN BÀN GHẾ TẠI X = 0) */}
      <group position={[0, 0, 3.25]}>
        {/* TV Cabinet */}
        <Suspense
          fallback={
            <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.35, 0.85, 0.50]} />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/wooden_dresser_drawer_pair.glb"
            filterMesh={(mesh) => !mesh.name.includes('Drawer_4')}
            targetDimensions={[1.35, 0.85, 0.50]}
            position={[0, 0, 0]}
            rotation={[0, Math.PI, 0]}
          />
        </Suspense>

        {/* 90s CRT Television (Đối diện trực diện bộ trường kỷ và bàn trà) */}
        <Suspense
          fallback={
            <mesh position={[0, 1.10, 0]} castShadow>
              <boxGeometry args={[0.58, 0.48, 0.44]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/old_television_from_90s.glb"
            targetDimensions={[0.58, 0.46, 0.42]}
            position={[-0.05, 0.85, 0]}
            rotation={[0, Math.PI, 0]}
          />
        </Suspense>

        {/* Vintage Vietnamese Electric Table Fan beside TV */}
        <Suspense fallback={null}>
          <AutoScaledGLB
            url="/models/case_000/table_fan.glb"
            targetDimensions={[0.28, 0.38, 0.24]}
            position={[0.46, 0.85, 0.05]}
            rotation={[0, Math.PI - 0.2, 0]}
          />
        </Suspense>
      </group>

      {/* 10. VINTAGE WASTEBASKET (ĐẶT CẠNH CỬA RA VÀO BÊN TRÁI TẠI X = -2.85) */}
      <Suspense
        fallback={
          <group position={[-2.85, 0.22, 3.42]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16, 0.13, 0.44, 16]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
            </mesh>
          </group>
        }
      >
        <AutoScaledGLB
          url="/models/case_000/concrete_trash_bin.glb"
          targetDimensions={[0.34, 0.44, 0.34]}
          position={[-2.85, 0, 3.42]}
        />
      </Suspense>

      {/* 11. 3D ANNOTATION PINS (8 CHUẨN ĐIỂM KHÁM XÉT HIỆN TRƯỜNG) */}
      <RoomHotspotPins onSelectSpot={onSelectSpot} activeSpotId={activeSpotId} />
    </group>
  )
}
