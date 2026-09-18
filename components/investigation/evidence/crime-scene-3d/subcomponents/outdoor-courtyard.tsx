'use client'

import React from 'react'
import * as THREE from 'three'

// ==========================================
// OUTDOOR COURTYARD GARDEN (SÂN VƯỜN NGOÀI CỬA CHÍNH - CHI TIẾT ĐẦY ĐỦ BẮC BỘ THỜI 1996)
// ==========================================
export function OutdoorCourtyardGarden({
  courtyardTexture,
  stoneTexture,
  barkTexture,
  woodTexture,
  skyBackdropTexture
}: {
  courtyardTexture: THREE.Texture
  stoneTexture: THREE.Texture
  barkTexture: THREE.Texture
  woodTexture?: THREE.Texture
  skyBackdropTexture?: THREE.Texture
}) {
  return (
    <group>
      {/* 1. COURTYARD BRICK GROUND (SÂN GẠCH BÁT TRÀNG ẨM ƯỚT CANH THEO CỬA CHÍNH TẠI X = -1.8) */}
      <mesh
        position={[-1.8, -0.22, 7.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[14.0, 7.5]} />
        <meshStandardMaterial
          map={courtyardTexture}
          roughness={0.42}
          metalness={0.12}
        />
      </mesh>

      {/* 2. DAMP SOIL PATCH UNDER XOAN TREE (ĐẤT ẨM GỐC XOAN) */}
      <mesh position={[-2.5, -0.21, 6.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.2, 24]} />
        <meshStandardMaterial color="#1a120c" roughness={0.9} />
      </mesh>

      {/* 3. FORENSIC FOOTPRINT TRAIL (DẤU CHÂN ĐẾ GIÀY NỮ SIZE 37 CỦA HÀ DẪN LÊN THỀM CỬA) */}
      {[
        { pos: [-2.75, -0.20, 6.4], rot: 0.35 },
        { pos: [-2.35, -0.21, 5.35], rot: 0.28 },
        { pos: [-1.95, -0.10, 4.38], rot: 0.20 },
        { pos: [-1.80, -0.005, 3.96], rot: 0.10 }
      ].map((fp, i) => (
        <group key={`footprint-${i}`} position={fp.pos as [number, number, number]} rotation={[-Math.PI / 2, 0, fp.rot]}>
          {/* Đế giày */}
          <mesh receiveShadow>
            <planeGeometry args={[0.085, 0.22]} />
            <meshStandardMaterial color="#0c0906" roughness={0.95} />
          </mesh>
          {/* Gân đế cao su thể thao */}
          {[-0.06, -0.02, 0.02, 0.06].map((offset, j) => (
            <mesh key={`tread-${j}`} position={[0, offset, 0.001]}>
              <planeGeometry args={[0.07, 0.012]} />
              <meshStandardMaterial color="#1f1610" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 4. WEATHERED STONE PORCH STEPS (BẬC TAM CẤP CANH THEO CỬA X = -1.8) */}
      <mesh position={[-1.8, -0.06, 3.98]} receiveShadow castShadow>
        <boxGeometry args={[2.08, 0.12, 0.42]} />
        <meshStandardMaterial map={stoneTexture} roughness={0.45} />
      </mesh>
      <mesh position={[-1.8, -0.16, 4.38]} receiveShadow castShadow>
        <boxGeometry args={[2.48, 0.12, 0.42]} />
        <meshStandardMaterial map={stoneTexture} roughness={0.45} />
      </mesh>

      {/* 5. DÉP TỔ ONG TRÊN BẬC THỀM ĐÁ */}
      <group position={[-1.32, -0.005, 3.98]} rotation={[0, -0.25, 0]}>
        <mesh position={[-0.055, 0, 0]}>
          <boxGeometry args={[0.085, 0.025, 0.22]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
        </mesh>
        <mesh position={[0.055, 0, 0]}>
          <boxGeometry args={[0.085, 0.025, 0.22]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
        </mesh>
      </group>

      {/* 6. CHỔI RƠM / CHỔI TRE QUÉT SÂN DỰNG GÓC TƯỜNG */}
      <group position={[-2.72, 0.55, 3.82]} rotation={[0.12, 0, -0.18]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.85, 8]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <coneGeometry args={[0.12, 0.45, 12]} />
          <meshStandardMaterial color="#a16207" roughness={0.85} />
        </mesh>
      </group>

      {/* 7. CHUM SÀNH HỨNG NƯỚC MƯA DA LƯƠN & GÁO DỪA BÊN HÔNG THỀM */}
      <group position={[-3.15, 0.12, 4.45]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.18, 0.64, 18]} />
          <meshStandardMaterial color="#382315" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <torusGeometry args={[0.26, 0.03, 8, 20]} />
          <meshStandardMaterial color="#2d1c11" roughness={0.35} />
        </mesh>
        <mesh position={[0.04, 0.34, 0.03]} rotation={[0.15, 0, 0.1]}>
          <cylinderGeometry args={[0.27, 0.27, 0.025, 16]} />
          <meshStandardMaterial map={woodTexture} roughness={0.6} />
        </mesh>
        <group position={[-0.1, 0.37, 0.05]} rotation={[0.2, 0.4, 0]}>
          <mesh position={[0, 0, 0.18]}>
            <cylinderGeometry args={[0.01, 0.01, 0.42, 6]} />
            <meshStandardMaterial color="#d97706" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.04, -0.05]}>
            <sphereGeometry args={[0.065, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#29180c" roughness={0.8} />
          </mesh>
        </group>
        <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 16]} />
          <meshStandardMaterial color="#162e1a" roughness={0.9} />
        </mesh>
      </group>

      {/* 8. MÁI HIÊN NGÓI RÊU PHONG CHE BẬC CỬA (PORCH AWNING VỚI KÈO GỖ LIM) */}
      <group position={[-1.8, 2.75, 4.25]}>
        <mesh position={[-1.3, -0.2, -0.25]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.6} />
        </mesh>
        <mesh position={[1.3, -0.2, -0.25]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.05, 0.45]}>
          <boxGeometry args={[3.2, 0.09, 0.09]} />
          <meshStandardMaterial map={woodTexture} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[0.32, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.3, 0.06, 1.25]} />
          <meshStandardMaterial color="#4a2e22" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.28, -0.55]}>
          <boxGeometry args={[3.35, 0.07, 0.12]} />
          <meshStandardMaterial color="#3d2319" roughness={0.8} />
        </mesh>
      </group>

      {/* 9. BỤI CHUỐI TIÊU GÓC SÂN (TROPICAL BANANA PLANTS) */}
      <group position={[2.4, -0.22, 6.6]}>
        {[
          { h: 1.8, r: 0.11, x: 0, z: 0, tilt: 0.05 },
          { h: 1.4, r: 0.09, x: -0.35, z: 0.2, tilt: -0.08 },
          { h: 0.9, r: 0.07, x: 0.3, z: -0.25, tilt: 0.1 }
        ].map((stem, idx) => (
          <mesh key={`banana-stem-${idx}`} position={[stem.x, stem.h / 2, stem.z]} rotation={[0, 0, stem.tilt]}>
            <cylinderGeometry args={[stem.r * 0.85, stem.r, stem.h, 10]} />
            <meshStandardMaterial color="#475f36" roughness={0.7} />
          </mesh>
        ))}
        {[
          { pos: [0, 1.7, 0], rot: [0.4, 0.2, 0.3], scale: [0.45, 1.4] },
          { pos: [0, 1.75, 0], rot: [-0.3, 1.5, -0.4], scale: [0.48, 1.5] },
          { pos: [0, 1.8, 0], rot: [0.2, -1.8, 0.5], scale: [0.44, 1.3] },
          { pos: [-0.35, 1.35, 0.2], rot: [0.5, 2.4, -0.2], scale: [0.4, 1.2] },
          { pos: [0.3, 0.9, -0.25], rot: [-0.2, -0.8, -0.4], scale: [0.35, 1.0] }
        ].map((leaf, lIdx) => (
          <mesh
            key={`banana-leaf-${lIdx}`}
            position={leaf.pos as [number, number, number]}
            rotation={leaf.rot as [number, number, number]}
          >
            <planeGeometry args={leaf.scale as [number, number]} />
            <meshStandardMaterial color="#2d4a24" roughness={0.65} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <mesh position={[0.1, 1.3, -0.1]} rotation={[0.8, 0.5, 0.2]}>
          <planeGeometry args={[0.36, 1.2]} />
          <meshStandardMaterial color="#856230" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 10. SCATTERED FALLEN XOAN FLOWERS */}
      {[
        [-2.1, -0.005, 3.82],
        [-1.9, -0.005, 3.88],
        [-1.6, -0.005, 3.84],
        [-2.2, -0.105, 4.25],
        [-1.7, -0.105, 4.32],
        [-1.4, -0.105, 4.22],
        [-2.0, -0.21, 4.75],
        [-2.55, -0.21, 6.2],
        [-2.25, -0.21, 6.35]
      ].map((pos, i) => (
        <mesh key={`xoan-petal-${i}`} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, i * 0.7]}>
          <circleGeometry args={[0.022, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#e9d5ff' : '#fef08a'} roughness={0.6} />
        </mesh>
      ))}

      {/* 11. GNARLY XOAN TREE (GỐC CÂY XOAN CỔ THỤ TRƯỚC SÂN) */}
      <group position={[-2.5, -0.22, 6.6]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 1.2, 12]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[0.08, 1.6, 0.05]} rotation={[0.12, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 1.1, 12]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[0.22, 2.5, 0.14]} rotation={[-0.1, 0, 0.22]} castShadow>
          <cylinderGeometry args={[0.13, 0.18, 1.0, 12]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[-0.38, 2.8, -0.15]} rotation={[0.5, -0.3, -0.8]} castShadow>
          <cylinderGeometry args={[0.07, 0.11, 1.4, 8]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[0.52, 3.0, 0.25]} rotation={[-0.3, 0.4, 0.7]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        {[
          [-0.7, 3.3, -0.3, 0.75],
          [-0.3, 3.6, -0.1, 0.65],
          [0.8, 3.5, 0.3, 0.85],
          [1.1, 3.7, 0.1, 0.6],
          [0.2, 3.9, -0.4, 0.7],
          [0.1, 4.2, 0.2, 0.8]
        ].map(([fx, fy, fz, fr], idx) => (
          <mesh key={`xoan-leaf-${idx}`} position={[fx, fy, fz]}>
            <dodecahedronGeometry args={[fr, 1]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#1b2f1f' : '#142518'} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 12. CERAMIC PLANTER POTS HAI BÊN BẬC CỬA */}
      <group position={[-3.15, -0.08, 4.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.4, 16]} />
          <meshStandardMaterial color="#472617" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 16]} />
          <meshStandardMaterial color="#3b1f13" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <dodecahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial color="#1f3b25" roughness={0.7} />
        </mesh>
      </group>
      <group position={[-0.45, -0.08, 4.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.24, 0.18, 0.42, 16]} />
          <meshStandardMaterial color="#2d3748" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.05, 16]} />
          <meshStandardMaterial color="#1a202c" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <dodecahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color="#1e3a24" roughness={0.7} />
        </mesh>
      </group>

      {/* 13. COURTYARD BOUNDARY WALL VỚI GẠCH THÔNG GIÓ & BIỂN SỐ NHÀ 14 */}
      <group position={[-1.8, 0.9, 9.2]}>
        <mesh position={[-3.8, 0, 0]} receiveShadow>
          <boxGeometry args={[6.5, 2.2, 0.24]} />
          <meshStandardMaterial color="#2d241c" roughness={0.9} />
        </mesh>
        {[-6.0, -5.3, -4.6, -3.9, -3.2, -2.5, -1.8].map((bx, bIdx) => (
          <mesh key={`breeze-left-${bIdx}`} position={[bx, 0.85, 0]}>
            <boxGeometry args={[0.48, 0.28, 0.22]} />
            <meshStandardMaterial color="#4b5563" roughness={0.8} />
          </mesh>
        ))}

        <mesh position={[3.8, 0, 0]} receiveShadow>
          <boxGeometry args={[6.5, 2.2, 0.24]} />
          <meshStandardMaterial color="#2d241c" roughness={0.9} />
        </mesh>
        {[1.8, 2.5, 3.2, 3.9, 4.6, 5.3, 6.0].map((bx, bIdx) => (
          <mesh key={`breeze-right-${bIdx}`} position={[bx, 0.85, 0]}>
            <boxGeometry args={[0.48, 0.28, 0.22]} />
            <meshStandardMaterial color="#4b5563" roughness={0.8} />
          </mesh>
        ))}

        <mesh position={[-0.6, 0.05, 0]}>
          <boxGeometry args={[0.36, 2.3, 0.36]} />
          <meshStandardMaterial color="#221b15" roughness={0.85} />
        </mesh>
        <mesh position={[0.6, 0.05, 0]}>
          <boxGeometry args={[0.36, 2.3, 0.36]} />
          <meshStandardMaterial color="#221b15" roughness={0.85} />
        </mesh>

        {/* Biển số nhà nhôm xanh cổ điển "SỐ 14" ghim trên trụ cổng trái */}
        <group position={[-0.58, 0.45, -0.19]}>
          <mesh>
            <boxGeometry args={[0.22, 0.14, 0.015]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.16, 0.09]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>

        {/* Cánh cổng sắt ngõ số 14 khép hờ */}
        <group position={[-0.42, -0.15, 0]} rotation={[0, 0.45, 0]}>
          <mesh position={[0.4, 0.5, 0]}>
            <boxGeometry args={[0.8, 1.7, 0.03]} />
            <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.4} />
          </mesh>
          {[-0.2, 0, 0.2].map((ox, oIdx) => (
            <mesh key={`iron-bar-${oIdx}`} position={[0.4 + ox, 0.5, 0.015]}>
              <boxGeometry args={[0.02, 1.6, 0.01]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0.75, 0.4, 0.03]}>
            <boxGeometry args={[0.05, 0.07, 0.04]} />
            <meshStandardMaterial color="#713f12" metalness={0.8} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* 14. MÁI NGÓI NHÀ HÀNG XÓM & ĂNG-TEN XƯƠNG CÁ 1996 (NEIGHBOR ROOFTOP & TV ANTENNA) */}
      <group position={[-5.8, 2.4, 9.8]}>
        <mesh position={[0, 0, 0]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[5.2, 0.2, 2.2]} />
          <meshStandardMaterial color="#3d281f" roughness={0.85} />
        </mesh>
        <group position={[0.8, 1.2, 0]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 1.8, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
          {[-0.25, 0, 0.25, 0.5].map((ay, aIdx) => (
            <mesh key={`antenna-fin-${ay}`} position={[0, 0.9 + ay, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, 0.55 - aIdx * 0.08, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 15. CỘT ĐIỆN BÊ TÔNG DÂN SINH NGOÀI NGÕ & DÂY ĐIỆN MẮC VÕNG */}
      <group position={[1.4, 1.8, 10.0]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.10, 0.14, 4.4, 10]} />
          <meshStandardMaterial color="#64748b" roughness={0.85} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <boxGeometry args={[0.85, 0.06, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>
        {[-0.35, 0, 0.35].map((sx, sIdx) => (
          <mesh key={`insulator-${sIdx}`} position={[sx, 3.2, 0]}>
            <cylinderGeometry args={[0.03, 0.035, 0.12, 8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Dây điện đen mắc từ cột điện ngõ vào mái hiên nhà */}
      <mesh position={[-0.2, 2.8, 7.2]} rotation={[0.3, 0.35, -0.15]}>
        <cylinderGeometry args={[0.005, 0.005, 6.2, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* 16. OVERCAST GLOOMY SKY BACKDROP BEHIND COURTYARD WALL (BẦU TRỜI ÂM U NGOÀI CỬA CHÍNH) */}
      {skyBackdropTexture && (
        <mesh position={[-1.8, 5.2, 10.2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[28.0, 10.0]} />
          <meshBasicMaterial map={skyBackdropTexture} toneMapped={false} />
        </mesh>
      )}

      {/* 17. OUTDOOR PORCH LANTERN TRÊN CỬA CHÍNH */}
      <group position={[-1.8, 2.55, 3.88]}>
        <mesh position={[0, 0.08, -0.06]}>
          <boxGeometry args={[0.04, 0.16, 0.12]} />
          <meshStandardMaterial color="#78350f" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.18, 0.24, 0.18]} />
          <meshStandardMaterial color="#1c1917" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#fffbeb" emissive="#f59e0b" emissiveIntensity={3.0} />
        </mesh>
        <pointLight
          position={[0, -0.1, 0.05]}
          color="#f59e0b"
          intensity={3.0}
          distance={7.0}
          decay={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.2}
          shadow-camera-far={8}
          shadow-bias={-0.0002}
          shadow-radius={1.5}
        />
      </group>

      {/* 18. OVERCAST GLOOMY SKYLIGHT OVER COURTYARD (ÁNH SÁNG TRỜI ÂM U CHO SÂN VƯỜN) */}
      <directionalLight
        position={[-1.8, 8.0, 8.5]}
        target-position={[-1.8, 0, 5.5]}
        color="#c8d6e5"
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0001}
        shadow-radius={2}
      />
      {/* Soft diffuse outdoor ambient fill */}
      <pointLight
        position={[-1.8, 3.5, 6.2]}
        color="#a4b0be"
        intensity={1.0}
        distance={12}
        decay={2}
      />
    </group>
  )
}
