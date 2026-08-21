'use client'

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Paperclip } from 'lucide-react'

export interface CaseFile {
  id: string
  code: string
  title: string
  date: string
  summary: string
  details?: string
}

export interface DrawerData {
  id: string
  label: string
  code: string
  position: [number, number, number]
  files: CaseFile[]
}

const DRAWERS_3D_DATA: DrawerData[] = Array.from({ length: 12 }).map((_, i) => {
  const row = Math.floor(i / 3)
  const col = i % 3
  const num = (i + 1).toString().padStart(2, '0')

  const x = (col - 1) * 2.3
  const y = (1.5 - row) * 1.5
  const z = 0

  return {
    id: `drawer-${num}`,
    label: i === 0 ? 'Án mạng Biệt thự Sương Mù' : i === 1 ? 'Vật chứng Hiện trường 02' : `Hồ sơ Mật Unit-${num}`,
    code: `UNIT-${num}`,
    position: [x, y, z],
    files: [
      {
        id: `f-${num}-1`,
        code: `DOC-${num}1`,
        title: `Báo cáo Điều tra Ban đầu #${num}`,
        date: '14/10/2024',
        summary: `Hồ sơ thu thập trong hộc tủ kim loại 3D số ${num}. Manh mối cấp quốc gia.`,
        details: 'Dấu vết mẫu ADN đối soát với hệ thống máy chủ dữ liệu tội phạm.',
      },
      {
        id: `f-${num}-2`,
        code: `DOC-${num}2`,
        title: `Biên bản Giám định Tang vật #${num}`,
        date: '16/10/2024',
        summary: 'Kiểm tra dải băng keo dính vết máu và bức thư nặc danh.',
        details: 'Phát hiện hàm lượng độc tố Kali Xyanua trên niêm phong.',
      },
      {
        id: `f-${num}-3`,
        code: `DOC-${num}3`,
        title: `Nhật ký Khám nghiệm #${num}`,
        date: '18/10/2024',
        summary: 'Diễn biến lời khai nghi phạm lúc 3:15 sáng.',
      },
    ],
  }
})

// COMPONENT MẶT NỔI TỦ CHI TIẾT (METALLIC DRAWER WITH DETAILED 3D GEOMETRY)
function MetallicDrawer3D({
  drawer,
  isOpen,
  onSelect,
}: {
  drawer: DrawerData
  isOpen: boolean
  onSelect: () => void
}) {
  const meshRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const targetZ = isOpen ? 1.7 : hovered ? 0.35 : 0
    const step = Math.min(delta * 8, 1)
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * step
  })

  return (
    <group ref={meshRef} position={drawer.position}>
      {/* 1. MẶT CHÍNH HỘC TỦ INOX SÁNG (DRAWER FRONT PANEL) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2.1, 1.25, 0.35]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#e4e4e7'}
          metalness={0.92}
          roughness={0.12}
        />
      </mesh>

      {/* 2. VIỀN GỜ KIM LOẠI NỔI BAO QUANH (BEVEL OUTER FRAME) */}
      <mesh position={[0, 0, 0.18]}>
        <boxGeometry args={[2.0, 1.15, 0.05]} />
        <meshStandardMaterial color={hovered ? '#d97706' : '#a1a1aa'} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 3. KHUNG KHÓA & Ổ KHÓA TRÒN CHUYÊN DỤNG (3D KEY LOCK CYLINDER) */}
      <mesh position={[0.75, 0.35, 0.22]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#18181b" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Lỗ khóa chìa */}
      <mesh position={[0.75, 0.35, 0.26]}>
        <boxGeometry args={[0.02, 0.06, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 4. TAY CẦM TRÒN KIM LOẠI UỐN BẬC (3D CURVED METALLIC HANDLE) */}
      {/* Chân tay cầm trái */}
      <mesh position={[-0.4, -0.15, 0.26]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.9} />
      </mesh>
      {/* Chân tay cầm phải */}
      <mesh position={[0.4, -0.15, 0.26]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.9} />
      </mesh>
      {/* Thanh nắm ngang */}
      <mesh position={[0, -0.15, 0.31]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.85, 16]} />
        <meshStandardMaterial color={hovered ? '#b45309' : '#27272a'} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* 5. KHUNG NHÃN ĐÍNH ĐINH ỐC 4 GÓC (BRASS LABEL FRAME & RIVETS) */}
      <mesh position={[-0.15, 0.25, 0.21]}>
        <planeGeometry args={[1.3, 0.35]} />
        <meshStandardMaterial color="#09090b" roughness={0.3} />
      </mesh>
      {/* Đinh ốc 4 góc khung nhãn */}
      {[-0.75, 0.45].map((xOffset) =>
        [0.1, 0.4].map((yOffset) => (
          <mesh key={`${xOffset}-${yOffset}`} position={[xOffset, yOffset, 0.22]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
          </mesh>
        ))
      )}

      {/* 6. TRONG LÒNG NGĂN KÉO MỞ (INTERIOR DETAILED MESH) */}
      {isOpen && (
        <group position={[0, -0.1, -1.0]}>
          {/* Đáy tủ */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[1.9, 0.1, 2.2]} />
            <meshStandardMaterial color="#27272a" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Vách trái */}
          <mesh position={[-0.95, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.9, 2.2]} />
            <meshStandardMaterial color="#3f3f46" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Vách phải */}
          <mesh position={[0.95, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.9, 2.2]} />
            <meshStandardMaterial color="#3f3f46" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* DÃY BÌA HỒ SƠ 3D ĐỘC LẬP TRONG NGĂN KÉO */}
          {drawer.files.map((file, idx) => (
            <group key={file.id} position={[0, 0.2 + idx * 0.08, -0.5 + idx * 0.4]} rotation={[-0.25, 0, 0]}>
              {/* Bìa Giấy Manila */}
              <mesh>
                <boxGeometry args={[1.5, 0.6, 0.04]} />
                <meshStandardMaterial color={idx === 0 ? '#fef3c7' : '#ffffff'} roughness={0.6} />
              </mesh>
              {/* Tab nhô lên bìa hồ sơ */}
              <mesh position={[-0.4 + idx * 0.3, 0.33, 0]}>
                <boxGeometry args={[0.4, 0.1, 0.04]} />
                <meshStandardMaterial color={idx === 0 ? '#d97706' : '#0284c7'} roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  )
}

function Scene3DRig({
  activeDrawerId,
  onSelectDrawer,
}: {
  activeDrawerId: string | null
  onSelectDrawer: (id: string | null) => void
}) {
  return (
    <>
      {/* HỆ THỐNG ÁNH SÁNG TRẮNG HIỆN ĐẠI SÁNG RÕ KHÔNG VÀNG */}
      <ambientLight intensity={2.5} color="#ffffff" />
      <directionalLight position={[8, 14, 10]} intensity={3.5} color="#ffffff" castShadow />
      <directionalLight position={[-8, 6, 8]} intensity={2.0} color="#f0f9ff" />
      <pointLight position={[0, 2, 6]} intensity={2.5} color="#ffffff" />

      {/* TƯỜNG SẮT KHUNG TỦ CHI TIẾT PHÍA SAU */}
      <mesh position={[0, 0, -0.3]}>
        <boxGeometry args={[7.6, 6.6, 0.4]} />
        <meshStandardMaterial color="#52525b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* CÁC ĐƯỜNG GỜ VÁT KIM LOẠI GIỮA CÁC Ô TỦ */}
      {[-1.15, 1.15].map((xPos) => (
        <mesh key={xPos} position={[xPos, 0, -0.05]}>
          <boxGeometry args={[0.08, 6.5, 0.2]} />
          <meshStandardMaterial color="#27272a" metalness={0.9} />
        </mesh>
      ))}

      {DRAWERS_3D_DATA.map((drawer) => (
        <MetallicDrawer3D
          key={drawer.id}
          drawer={drawer}
          isOpen={activeDrawerId === drawer.id}
          onSelect={() => onSelectDrawer(activeDrawerId === drawer.id ? null : drawer.id)}
        />
      ))}
    </>
  )
}

export default function Real3DFilingCabinet() {
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null)
  const [inspectingFile, setInspectingFile] = useState<CaseFile | null>(null)

  const activeDrawer = DRAWERS_3D_DATA.find((d) => d.id === activeDrawerId)

  return (
    <div className="relative h-[680px] w-full bg-stone-900 rounded-xl border-4 border-stone-700 shadow-2xl overflow-hidden font-mono select-none flex flex-col justify-between">
      {/* 3D WebGL Canvas Stage */}
      <div className="relative w-full h-full">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 50 }}>
          <Scene3DRig activeDrawerId={activeDrawerId} onSelectDrawer={setActiveDrawerId} />
        </Canvas>

        {/* HUD Info */}
        <div className="absolute top-4 left-4 pointer-events-none bg-stone-900/95 backdrop-blur border border-stone-700 px-3.5 py-2 rounded text-xs z-10 shadow-lg">
          <span className="text-amber-400 font-bold tracking-wider">HỆ THỐNG TỦ SẮT KẸP HỒ SƠ 3D DETAIL</span>
          <p className="text-[10px] text-stone-300 mt-0.5">Click trực tiếp vào từng ô tủ inox để rút mở ngăn kéo!</p>
        </div>

        {/* Close Drawer Button */}
        {activeDrawerId && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setActiveDrawerId(null)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded text-xs font-bold shadow-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> ĐÓNG NGĂN KÉO 3D
            </button>
          </div>
        )}

        {/* File Panel overlay when drawer is open */}
        <AnimatePresence>
          {activeDrawer && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute bottom-4 inset-x-4 bg-stone-900/95 backdrop-blur-md border-2 border-amber-600 rounded-lg p-4 shadow-2xl z-20 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-bold text-amber-400 font-serif">
                  {activeDrawer.label} ({activeDrawer.code})
                </span>
                <span className="text-[10px] text-stone-400">CLICK HỒ SƠ ĐỂ XEM CHI TIẾT</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {activeDrawer.files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setInspectingFile(file)}
                    className="p-2.5 bg-stone-950 border border-stone-700 hover:border-amber-500 rounded cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-500 mb-1">
                      <span>{file.code}</span>
                      <Paperclip className="w-3 h-3 text-stone-500 group-hover:text-amber-400" />
                    </div>
                    <div className="text-xs font-bold text-stone-200 truncate">{file.title}</div>
                    <div className="text-[9px] text-stone-400 line-clamp-1 mt-0.5">{file.summary}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {inspectingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setInspectingFile(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-amber-50 text-stone-900 border-8 border-amber-950/60 rounded shadow-2xl p-6 font-mono"
            >
              <div className="absolute top-4 right-12 border-2 border-red-700 text-red-700 font-black text-xs px-2 py-1 rotate-12 opacity-85 pointer-events-none">
                TOP SECRET / MẬT
              </div>

              <button
                onClick={() => setInspectingFile(null)}
                className="absolute top-3 right-3 p-1 text-stone-600 hover:text-stone-950 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b-2 border-stone-800 pb-3 mb-4">
                <span className="text-xs bg-stone-900 text-amber-400 px-2 py-0.5 rounded font-bold">
                  {inspectingFile.code}
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-950 mt-2">{inspectingFile.title}</h3>
                <div className="text-xs text-stone-600 mt-1">Ngày lập hồ sơ: {inspectingFile.date}</div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-xs uppercase text-amber-900 tracking-wider">Tóm tắt nội dung:</h4>
                  <p className="text-stone-800 mt-1 leading-relaxed">{inspectingFile.summary}</p>
                </div>

                {inspectingFile.details && (
                  <div className="bg-amber-100/90 p-3.5 rounded border border-amber-300/80">
                    <h4 className="font-bold text-xs uppercase text-amber-950 tracking-wider">Ghi chú điều tra mở rộng:</h4>
                    <p className="text-stone-900 text-xs mt-1 leading-relaxed">{inspectingFile.details}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-300 flex justify-end">
                <button
                  onClick={() => setInspectingFile(null)}
                  className="px-5 py-2 bg-stone-900 text-amber-100 rounded text-xs font-bold hover:bg-stone-800"
                >
                  CẤT HỒ SƠ VÀO TỦ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
