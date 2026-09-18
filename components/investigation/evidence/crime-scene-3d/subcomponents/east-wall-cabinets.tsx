'use client'

import React from 'react'
import * as THREE from 'three'

// ==========================================
// 1. VINTAGE GLASS DISPLAY CABINET (TỦ BÚP-PHÊ KÍNH BÀY ĐỒ LƯU NIỆM THỜI 1996)
// Đặt tại góc tường Đông phía Bắc cửa sổ (X = 2.52, Z = -2.0)
// ==========================================
export function VintageGlassDisplayCabinet({
  woodTexture,
  woodNormalMap,
  woodRoughnessMap
}: {
  woodTexture: THREE.Texture
  woodNormalMap?: THREE.Texture
  woodRoughnessMap?: THREE.Texture
}) {
  return (
    <group position={[2.52, 0, -2.0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* 4 Bracket Feet (4 chân tủ thấp) */}
      {[
        [-0.64, 0.04, -0.18],
        [0.64, 0.04, -0.18],
        [-0.64, 0.04, 0.18],
        [0.64, 0.04, 0.18]
      ].map((pos, i) => (
        <mesh key={`cab-foot-${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.4} />
        </mesh>
      ))}

      {/* Main Base Plinth (Đế tủ dưới) */}
      <mesh position={[0, 0.10, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.06, 0.44]} />
        <meshStandardMaterial map={woodTexture} roughness={0.35} />
      </mesh>

      {/* LOWER WOODEN CABINET BODY (TỦ DƯỚI 2 CÁNH GỖ: Y = 0.13 to 0.82) */}
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.40, 0.70, 0.42]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.32}
        />
      </mesh>
      {/* 2 Lower Door Inset Panels with carved frames */}
      {[-0.34, 0.34].map((dx, di) => (
        <group key={`low-door-${di}`} position={[dx, 0.48, 0.212]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.64, 0.015]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.54, 0.56, 0.008]} />
            <meshStandardMaterial color="#2d170d" roughness={0.45} />
          </mesh>
          {/* Brass Ring Drop Pull */}
          <mesh position={[di === 0 ? 0.22 : -0.22, 0.08, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.022, 0.004, 8, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* MIDDLE WAIST MOLDING / COUNTERTOP (MẶT NGĂN GIỮA: Y = 0.84) */}
      <mesh position={[0, 0.84, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[1.46, 0.04, 0.46]} />
        <meshStandardMaterial map={woodTexture} roughness={0.3} />
      </mesh>

      {/* UPPER GLASS DISPLAY SECTION (TỦ KÍNH BÀY ĐỒ PHÍA TRÊN: Y = 0.86 to 1.84) */}
      {/* Backboard */}
      <mesh position={[0, 1.35, -0.19]} receiveShadow>
        <boxGeometry args={[1.36, 0.98, 0.02]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-0.68, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.98, 0.40]} />
        <meshStandardMaterial map={woodTexture} roughness={0.35} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[0.68, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.98, 0.40]} />
        <meshStandardMaterial map={woodTexture} roughness={0.35} />
      </mesh>
      {/* Top Crown Molding */}
      <mesh position={[0, 1.86, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[1.48, 0.06, 0.46]} />
        <meshStandardMaterial map={woodTexture} roughness={0.3} />
      </mesh>

      {/* 2 Internal Glass Shelves (2 đợt kính chịu lực bên trong) */}
      {[1.18, 1.50].map((sy, si) => (
        <mesh key={`glass-shelf-${si}`} position={[0, sy, 0]} receiveShadow>
          <boxGeometry args={[1.32, 0.012, 0.36]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transmission={0.9}
            roughness={0.08}
            transparent
            opacity={0.8}
            thickness={0.012}
          />
        </mesh>
      ))}

      {/* Front Glass Sliding Panels (Cửa kính lùa phía trước) */}
      <mesh position={[-0.33, 1.35, 0.195]} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.94, 0.008]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transmission={0.92}
          roughness={0.06}
          metalness={0.05}
          transparent
          opacity={0.65}
          thickness={0.008}
        />
      </mesh>
      <mesh position={[0.33, 1.35, 0.205]} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.94, 0.008]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transmission={0.92}
          roughness={0.06}
          metalness={0.05}
          transparent
          opacity={0.65}
          thickness={0.008}
        />
      </mesh>

      {/* ================================================================= */}
      {/* PROPS INSIDE GLASS CABINET (CÁC VẬT PHẨM BÀY TRONG TỦ KÍNH BÚP-PHÊ) */}
      {/* ================================================================= */}
      {/* Shelf 1 (Bottom Interior Y = 0.86 to 1.18): Antique Bát Tràng Ceramic Tea Set & Trophy */}
      <group position={[-0.38, 0.86, 0]}>
        {/* Blue and White Ceramic Ginger Jar */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.24, 18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <sphereGeometry args={[0.045, 14, 12]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.2} />
        </mesh>
      </group>
      <group position={[0.36, 0.86, 0]}>
        {/* Brass Commemorative Plate on Wooden Stand */}
        <mesh position={[0, 0.14, -0.02]} rotation={[0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.012, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.04, 0.02]}>
          <boxGeometry args={[0.08, 0.08, 0.06]} />
          <meshStandardMaterial map={woodTexture} roughness={0.4} />
        </mesh>
      </group>

      {/* Shelf 2 (Middle Shelf Y = 1.18 to 1.50): Framed Certificate & Small Clock */}
      <group position={[0, 1.19, 0]}>
        {/* Stack of Vintage Leather Books */}
        <group position={[-0.42, 0.05, 0]}>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.22, 0.04, 0.16]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
          </mesh>
          <mesh position={[0.01, 0.055, 0.01]} rotation={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.20, 0.035, 0.15]} />
            <meshStandardMaterial color="#14532d" roughness={0.7} />
          </mesh>
          <mesh position={[-0.01, 0.085, -0.01]} rotation={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.19, 0.03, 0.14]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
          </mesh>
        </group>

        {/* Vintage Desk Clock with Twin Bells */}
        <group position={[0.42, 0.08, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.04, 20]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.021]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.045, 18]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.3} />
          </mesh>
          {/* Twin Bells on top */}
          <mesh position={[-0.038, 0.055, 0]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0.038, 0.055, 0]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>

        {/* Framed Family Portrait in Center */}
        <group position={[0, 0.11, -0.08]} rotation={[-0.15, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.20, 0.16, 0.015]} />
            <meshStandardMaterial color="#b45309" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.16, 0.12]} />
            <meshStandardMaterial color="#e2d5c5" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Shelf 3 (Top Shelf Y = 1.50 to 1.84): Row of Antique Ceramic Bowls */}
      <group position={[0, 1.51, 0]}>
        {[-0.40, -0.15, 0.15, 0.40].map((bx, bi) => (
          <group key={`top-bowl-${bi}`} position={[bx, 0.04, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.065, 0.035, 0.055, 16]} />
              <meshStandardMaterial color={bi % 2 === 0 ? '#f1f5f9' : '#e0e7ff'} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// ==========================================
// 2. VINTAGE TELEPHONE SIDEBOARD / DESK (TỦ KỆ GỖ ĐỂ ĐIỆN THOẠI BÀN 1996)
// Đặt tại góc tường Đông phía Nam cửa sổ (X = 2.54, Z = +2.45)
// ==========================================
export function VintageTelephoneCabinet({
  woodTexture,
  woodNormalMap,
  woodRoughnessMap
}: {
  woodTexture: THREE.Texture
  woodNormalMap?: THREE.Texture
  woodRoughnessMap?: THREE.Texture
}) {
  return (
    <group position={[2.54, 0, 2.45]} rotation={[0, -Math.PI / 2, 0]}>
      {/* 4 Turned Legs (4 chân con tiện) */}
      {[
        [-0.48, 0, -0.18],
        [0.48, 0, -0.18],
        [-0.48, 0, 0.18],
        [0.48, 0, 0.18]
      ].map((pos, i) => (
        <group key={`tel-leg-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 0.40, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.020, 0.80, 12]} />
            <meshStandardMaterial map={woodTexture} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Main Console Top (Mặt bàn gỗ lim) */}
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.08, 0.04, 0.44]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.28}
        />
      </mesh>

      {/* 2 Upper Drawers Housing (Khối 2 ngăn kéo) */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.02, 0.16, 0.40]} />
        <meshStandardMaterial map={woodTexture} roughness={0.35} />
      </mesh>
      {/* 2 Drawer Fronts with Brass Knob Pulls */}
      {[-0.24, 0.24].map((dx, di) => (
        <group key={`tel-drawer-${di}`} position={[dx, 0.72, 0.205]}>
          <mesh castShadow>
            <boxGeometry args={[0.46, 0.13, 0.012]} />
            <meshStandardMaterial map={woodTexture} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0, 0.015]} castShadow>
            <sphereGeometry args={[0.012, 12, 10]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Lower Slat Shelf (Đợt nan để sách báo phía dưới) */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.98, 0.02, 0.36]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      {/* Stacks of Old Newspapers (Chồng báo Nhân Dân & Hà Nội Mới 1996) */}
      <group position={[-0.22, 0.24, 0]}>
        <mesh position={[0, 0.025, 0]} rotation={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.34, 0.035, 0.24]} />
          <meshStandardMaterial color="#e2d5c5" roughness={0.8} />
        </mesh>
        <mesh position={[0.01, 0.055, 0]} rotation={[0, -0.08, 0]} castShadow>
          <boxGeometry args={[0.33, 0.03, 0.23]} />
          <meshStandardMaterial color="#dcd3c1" roughness={0.85} />
        </mesh>
      </group>

      {/* ================================================================= */}
      {/* 1990s ROTARY DIAL TELEPHONE & NOTEPAD (ĐIỆN THOẠI QUAY SỐ BẮC BỘ 1996) */}
      {/* ================================================================= */}
      <group position={[-0.18, 0.84, 0.02]}>
        {/* Telephone Base (Thân máy điện thoại để bàn màu đỏ mận cổ điển) */}
        <mesh position={[0, 0.045, 0]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.18]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Rotary Dial Wheel (Đĩa quay số màu kem) */}
        <mesh position={[0, 0.09, 0.02]} rotation={[-0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.048, 0.048, 0.012, 20]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.096, 0.02]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.014, 16]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
        </mesh>
        {/* Handset Cradle & Handset (Ống nghe điện thoại) */}
        <group position={[0, 0.10, -0.04]}>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.22, 12]} />
            <meshStandardMaterial color="#450a0a" roughness={0.35} />
          </mesh>
          <mesh position={[-0.09, 0, 0]} castShadow>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#450a0a" roughness={0.35} />
          </mesh>
          <mesh position={[0.09, 0, 0]} castShadow>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#450a0a" roughness={0.35} />
          </mesh>
        </group>
      </group>

      {/* Desk Pen Holder & Phonebook (Sổ tay danh bạ & ống cắm bút) */}
      <group position={[0.26, 0.84, -0.02]}>
        {/* Phone Directory Notepad */}
        <mesh position={[0, 0.01, 0.04]} rotation={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.14, 0.018, 0.18]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.6} />
        </mesh>
        {/* Ceramic Pen Cup */}
        <mesh position={[0.08, 0.045, -0.08]} castShadow>
          <cylinderGeometry args={[0.025, 0.020, 0.08, 14]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* 2 Ballpoint Pens */}
        <mesh position={[0.075, 0.09, -0.08]} rotation={[0.15, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.11, 8]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0.085, 0.09, -0.075]} rotation={[-0.2, 0.1, -0.15]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.11, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

// ==========================================
// 3. LOW SILL PLANT STAND (KỆ HOA CÂY CẢNH DƯỚI BẬC CỬA SỔ X = 2.62, Z = 0.5)
// ==========================================
export function WindowSillPlantBench({ woodTexture }: { woodTexture: THREE.Texture }) {
  return (
    <group position={[2.62, 0, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Rustic Wooden Bench (Băng ghế gỗ mộc thấp kê chậu hoa) */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.035, 0.28]} />
        <meshStandardMaterial map={woodTexture} roughness={0.5} />
      </mesh>
      {/* 4 Bench Legs */}
      {[
        [-0.44, 0.18, -0.10],
        [0.44, 0.18, -0.10],
        [-0.44, 0.18, 0.10],
        [0.44, 0.18, 0.10]
      ].map((pos, i) => (
        <mesh key={`b-leg-${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.035, 0.36, 0.035]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>
      ))}

      {/* Terracotta Plant Pot 1 (Chậu hoa gốm đỏ nung) */}
      <group position={[-0.26, 0.40, 0]}>
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.065, 0.16, 16]} />
          <meshStandardMaterial color="#9a3412" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.015, 16]} />
          <meshStandardMaterial color="#1a120b" roughness={0.9} />
        </mesh>
        {/* Snake Plant Leaves (Lá cây lưỡi hổ xanh mướt vươn lên đón nắng cửa sổ) */}
        {[
          { rot: [0.1, 0, 0.1], h: 0.32, ox: 0, oz: 0 },
          { rot: [-0.15, 0.6, -0.1], h: 0.28, ox: 0.03, oz: 0.02 },
          { rot: [0.12, -0.8, -0.15], h: 0.26, ox: -0.03, oz: -0.02 },
          { rot: [-0.08, 1.2, 0.12], h: 0.22, ox: 0.02, oz: -0.03 }
        ].map((leaf, li) => (
          <mesh
            key={`snake-leaf-${li}`}
            position={[leaf.ox, 0.18 + leaf.h / 2, leaf.oz]}
            rotation={leaf.rot as [number, number, number]}
            castShadow
          >
            <boxGeometry args={[0.032, leaf.h, 0.008]} />
            <meshStandardMaterial color="#15803d" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Terracotta Plant Pot 2 with flowering orchid/bush */}
      <group position={[0.26, 0.40, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.055, 0.14, 16]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.015, 16]} />
          <meshStandardMaterial color="#1a120b" roughness={0.9} />
        </mesh>
        {/* Green Foliage */}
        <mesh position={[0, 0.23, 0]} castShadow>
          <dodecahedronGeometry args={[0.11, 1]} />
          <meshStandardMaterial color="#166534" roughness={0.7} />
        </mesh>
        {/* Small Yellow Flower Buds */}
        {[
          [0.04, 0.32, 0.03],
          [-0.05, 0.30, -0.02],
          [0.02, 0.33, -0.04]
        ].map((fPos, fi) => (
          <mesh key={`bud-${fi}`} position={fPos as [number, number, number]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
