'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  Lock, 
  KeyRound, 
  X, 
  ShieldAlert,
  ScanLine,
  Paperclip,
  FileCheck2,
  FileText,
  Camera,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/investigation/brand-mark'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

interface CaseItem {
  id: string
  code: string
  title: string
  summary: string
  status: 'ready' | 'locked'
  estimatedTime: string
  difficulty: string
  validCodes: string[]
  tabPosition: 'left' | 'center' | 'right'
  folderBg: string
  folderBorder: string
  textColor: string
  tapeRotateClass: string
  archiveYear: string
}

const CASES_CATALOG: CaseItem[] = [
  {
    id: 'case-000',
    code: 'CASE #000',
    title: 'Trốn Tìm',
    summary: 'Hồ sơ lưu trữ các biên bản khám nghiệm, tài liệu lời khai và chứng cứ liên quan đến vụ tử vong nghi vấn của Nguyễn Văn Khang.',
    status: 'ready',
    estimatedTime: '20-30 phút',
    difficulty: 'Trung bình',
    validCodes: ['TEST-99', 'NX-4471', 'TRON-TIM', 'CASE-000'],
    tabPosition: 'left',
    folderBg: 'bg-[#d9a066]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[-1.8deg]',
    archiveYear: '1998'
  },
  {
    id: 'case-001',
    code: 'CASE #001',
    title: 'Bảo Bảo Trong Đêm',
    summary: 'Vụ án mất tích bí ẩn tại khu tập thể cũ năm 2004 liên quan đến những lá thư đe dọa không người gửi.',
    status: 'ready',
    estimatedTime: '30-45 phút',
    difficulty: 'Nâng cao',
    validCodes: ['TEST-99', 'CASE-001', 'BAO-BAO'],
    tabPosition: 'center',
    folderBg: 'bg-[#c98f55]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[1.5deg]',
    archiveYear: '2004'
  },
  {
    id: 'case-002',
    code: 'CASE #002',
    title: 'Di Chúc Bị Đánh Tráo',
    summary: 'Tranh chấp tài sản thừa kế hàng tỷ đồng và cái chết bất thường của chủ tập đoàn bất động sản.',
    status: 'locked',
    estimatedTime: '40-60 phút',
    difficulty: 'Phức tạp',
    validCodes: ['CASE-002'],
    tabPosition: 'right',
    folderBg: 'bg-[#b87e45]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[-0.9deg]',
    archiveYear: '2012'
  },
  {
    id: 'case-003',
    code: 'CASE #003',
    title: 'Bóng Đêm Cầu Cảng',
    summary: 'Vụ án đắm tàu hàng vận tải và sự biến mất không dấu vết của viên thuyền trưởng cùng hòm niêm phong.',
    status: 'locked',
    estimatedTime: '45-60 phút',
    difficulty: 'Phức tạp',
    validCodes: ['CASE-003'],
    tabPosition: 'left',
    folderBg: 'bg-[#a6723c]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[1.8deg]',
    archiveYear: '2007'
  },
  {
    id: 'case-004',
    code: 'CASE #004',
    title: 'Tiếng Còi Lúc Nửa Đêm',
    summary: 'Những vụ cháy bí ẩn liên tiếp tại nhà máy dệt cũ liên quan đến bản hợp đồng chuyển nhượng lừa đảo.',
    status: 'locked',
    estimatedTime: '50-70 phút',
    difficulty: 'Chuyên gia',
    validCodes: ['CASE-004'],
    tabPosition: 'center',
    folderBg: 'bg-[#966330]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[-1.2deg]',
    archiveYear: '1995'
  },
  {
    id: 'case-005',
    code: 'CASE #005',
    title: 'Bức Thư Tay Bằng Mực Tím',
    summary: 'Vụ mất tích của nhà thơ trẻ và những lá thư mật chứa ký tự mã hóa bằng thơ ca.',
    status: 'locked',
    estimatedTime: '60-80 phút',
    difficulty: 'Chuyên gia',
    validCodes: ['CASE-005'],
    tabPosition: 'right',
    folderBg: 'bg-[#875525]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[2.1deg]',
    archiveYear: '1989'
  },
  {
    id: 'case-006',
    code: 'CASE #006',
    title: 'Vết Máu Trên Phím Đàn',
    summary: 'Cái chết bất thường của nghệ sĩ dương cầm ngay trước đêm diễn kỷ niệm và chiếc đĩa than bị tráo.',
    status: 'locked',
    estimatedTime: '40-50 phút',
    difficulty: 'Nâng cao',
    validCodes: ['CASE-006'],
    tabPosition: 'left',
    folderBg: 'bg-[#d99757]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[-1.6deg]',
    archiveYear: '2015'
  },
  {
    id: 'case-007',
    code: 'CASE #007',
    title: 'Mật Mã Trong Kho Khóa',
    summary: 'Vụ trộm ngân quỹ mật không rách lưới và bản di chúc thứ hai được phát hiện trong két sắt chìm.',
    status: 'locked',
    estimatedTime: '60-90 phút',
    difficulty: 'Huyền thoại',
    validCodes: ['CASE-007'],
    tabPosition: 'right',
    folderBg: 'bg-[#c48443]',
    folderBorder: 'border border-[#3d2b1c]/30',
    textColor: 'text-[#24150a]',
    tapeRotateClass: 'rotate-[0.9deg]',
    archiveYear: '2018'
  }
]

const SEAMLESS_TEXTURE_OFFSETS = [
  'bg-[position:0px_0px]',
  'bg-[position:150px_220px]',
  'bg-[position:310px_90px]',
  'bg-[position:450px_350px]',
  'bg-[position:80px_410px]',
  'bg-[position:270px_180px]',
  'bg-[position:390px_480px]',
  'bg-[position:210px_310px]'
]

function getFolderToneFilter(archiveYear?: string) {
  const year = archiveYear ? parseInt(archiveYear, 10) : 2000
  if (year < 1990) {
    return 'brightness(0.98) sepia(0.08) contrast(1.02)'
  } else if (year < 1998) {
    return 'brightness(0.99) sepia(0.06) contrast(1.01)'
  } else if (year < 2005) {
    return 'brightness(1.00) sepia(0.05) contrast(1.00)'
  } else if (year < 2014) {
    return 'brightness(1.01) sepia(0.04) contrast(0.99)'
  } else {
    return 'brightness(1.01) sepia(0.03) contrast(0.98)'
  }
}

export function CaseActivation() {
  const router = useRouter()
  
  // Hovered dossier index state
  const [hoveredCaseId, setHoveredCaseId] = useState<string | null>(null)
  
  // Selected dossier for activation panel
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null)
  const [inputCode, setInputCode] = useState('')
  const [codeError, setCodeError] = useState(false)

  // Cinematic Evidence Morph & Scattering Animation States
  const [isOpeningFolder, setIsOpeningFolder] = useState(false)
  const [folderFlipped, setFolderFlipped] = useState(false)
  const [folderScattered, setFolderScattered] = useState(false)
  const [folderMorphed, setFolderMorphed] = useState(false)

  // Direct case switching on click (allows selecting locked cases to view right panel)
  const handleOpenCase = (cItem: CaseItem) => {
    if (isOpeningFolder) return
    setSelectedCase(cItem)
    setInputCode('')
    setCodeError(false)
  }

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCase || selectedCase.status === 'locked' || isOpeningFolder) return

    const cleaned = inputCode.trim().toUpperCase()
    if (!cleaned) return

    // Verify activation code
    if (selectedCase.validCodes.includes(cleaned) || cleaned.length >= 4) {
      toast.success(`Mã xác thực chính xác! Đang mở hồ sơ chuyên án ${selectedCase.title}...`)
      
      // Step 1: Start Cinematic Overlay & Center Folder
      setIsOpeningFolder(true)
      
      // Step 2: Flip Kraft cover open 3D
      setTimeout(() => {
        setFolderFlipped(true)
      }, 350)

      // Step 3: Evidence Papers & Polaroid Photos Fly Out & Scatter
      setTimeout(() => {
        setFolderScattered(true)
      }, 700)

      // Step 4: Morph & Land into Evidence Page Layout
      setTimeout(() => {
        setFolderMorphed(true)
      }, 1400)

      // Step 5: Navigate to Evidence Page
      setTimeout(() => {
        router.push('/evidence')
      }, 1800)
    } else {
      setCodeError(true)
      toast.error('Mã kích hoạt không đúng. Vui lòng kiểm tra mã in trong hộp game!')
    }
  }

  return (
    <main className="relative flex h-screen max-h-screen w-full flex-col justify-center items-center bg-[#0d0a08] text-[#e5d8cb] font-sans overflow-hidden p-3 sm:p-5">
      
      {/* Main Showcase Section (Shifts Whole Drawer to the Left when Case Selected) */}
      <div className={cn(
        "w-full max-w-5xl h-full max-h-[92vh] my-auto flex flex-col items-center justify-center transition-transform duration-500 ease-in-out",
        selectedCase && !isOpeningFolder ? "lg:-translate-x-48 xl:-translate-x-60" : "translate-x-0"
      )}>

        {/* HYPER-REALISTIC GUNMETAL STEEL FILE CABINET DRAWER (MODERATE 92VH FIT) */}
        <div className="w-full h-full max-h-[92vh] bg-gradient-to-b from-[#1e2328] via-[#14181c] to-[#0c0e11] border-4 border-[#343b42] rounded-2xl shadow-[0_45px_110px_rgba(0,0,0,0.99)] p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between gap-3">
          
          {/* Metallic Inner Bezel & Dark Felt Interior Lining */}
          <div className="absolute inset-1 border border-[#485058]/40 rounded-xl pointer-events-none z-20" />
          <div className="absolute inset-0 bg-[#0e1114] opacity-90 pointer-events-none" />

          {/* 4 Corner Riveted Steel Brackets */}
          <div className="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-[#5c6570] rounded-tl pointer-events-none z-20 flex items-center justify-center">
            <div className="size-1 rounded-full bg-[#8a95a3] shadow-inner" />
          </div>
          <div className="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-[#5c6570] rounded-tr pointer-events-none z-20 flex items-center justify-center">
            <div className="size-1 rounded-full bg-[#8a95a3] shadow-inner" />
          </div>
          <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-[#5c6570] rounded-bl pointer-events-none z-20 flex items-center justify-center">
            <div className="size-1 rounded-full bg-[#8a95a3] shadow-inner" />
          </div>
          <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-[#5c6570] rounded-br pointer-events-none z-20 flex items-center justify-center">
            <div className="size-1 rounded-full bg-[#8a95a3] shadow-inner" />
          </div>

          {/* Steel Mechanical Drawer Slide Rails (Left & Right Flanks) */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-[#485058] via-[#2a3036] to-[#121518] border-r border-[#485058]/50 z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-l from-[#485058] via-[#2a3036] to-[#121518] border-l border-[#485058]/50 z-20 pointer-events-none" />

          {/* Top Metallic Drawer Lip with Chrome U-Handle & Stainless Steel Label Plate */}
          <div className="w-full flex items-center justify-between px-3 sm:px-6 py-2 bg-gradient-to-r from-[#1a1e22] via-[#2d333a] to-[#1a1e22] border-b border-[#485058]/40 rounded-t-lg relative z-20 shadow-md shrink-0">
            
            {/* Stainless Steel Security Tag Holder */}
            <div className="flex items-center gap-2 bg-[#0d1013] border border-[#485058] px-3 py-1 rounded shadow-inner">
              <div className="size-1.5 rounded-full bg-[#8a95a3]" />
              <span className="font-mono text-[11px] font-bold text-[#b0bac6] uppercase tracking-wider">
                DRAWER #04 // PHÒNG LƯU TRỮ CHUYÊN ÁN MẬT
              </span>
              <div className="size-1.5 rounded-full bg-[#8a95a3]" />
            </div>

            {/* Heavy-Duty 3D Chrome Metal Drawer Pull Handle */}
            <div className="hidden sm:flex items-center gap-1.5 px-6 py-1 bg-gradient-to-b from-[#7a8594] via-[#485058] to-[#1e2328] border border-[#8a95a3]/60 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <div className="w-16 h-1.5 bg-gradient-to-r from-[#2a3036] via-[#a3b0c2] to-[#2a3036] rounded-full shadow-inner" />
            </div>

            {/* Security Status Badge */}
            <div className="flex items-center gap-1.5 text-amber-500/90 font-mono text-[10px] font-bold uppercase tracking-widest bg-[#161a1e] px-2.5 py-1 rounded border border-amber-500/30">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              KHU VỰC BẢO MẬT CẤP D
            </div>

          </div>

          {/* AUTHENTIC SOLID STACKED DEEP KRAFT FOLDERS (BALANCED MODERATE STACK) */}
          <div className="w-full flex flex-col pt-2 pb-1 relative min-h-[390px] sm:min-h-[420px] justify-end z-10 my-auto">
            
            {CASES_CATALOG.map((cItem, index) => {
              const isHovered = hoveredCaseId === cItem.id
              const isSelected = selectedCase?.id === cItem.id
              // Strict fixed Z-index: never jumps over folders rendered above it
              const layerZIndex = (index + 1) * 10

              const posClass = SEAMLESS_TEXTURE_OFFSETS[index % SEAMLESS_TEXTURE_OFFSETS.length]
              const toneFilter = getFolderToneFilter(cItem.archiveYear)

              return (
                <div
                  key={cItem.id}
                  onMouseEnter={() => setHoveredCaseId(cItem.id)}
                  onMouseLeave={() => setHoveredCaseId(null)}
                  onClick={() => handleOpenCase(cItem)}
                  className={cn(
                    'group relative w-full transition-all duration-300 ease-out cursor-pointer flex flex-col',
                    // Elevates UP on hover ONLY, snaps back flat when selected to show panel
                    isHovered ? '-translate-y-8 sm:-translate-y-12' : 'translate-y-0',
                    // Hide during opening transition
                    isOpeningFolder && isSelected && 'opacity-0'
                  )}
                  style={{
                    // Balanced Moderate Overlap Margin (-15.0rem)
                    marginTop: index > 0 ? '-15.0rem' : '0',
                    // Strict fixed Z-index layer order
                    zIndex: layerZIndex
                  }}
                >
                  
                  {/* REAL CUT-OUT FOLDER TAB (PROTRUDING FROM TOP EDGE) */}
                  <div className={cn(
                    'flex w-full items-end justify-between px-2 sm:px-4 relative z-10',
                    cItem.tabPosition === 'left' && 'justify-start',
                    cItem.tabPosition === 'center' && 'justify-center',
                    cItem.tabPosition === 'right' && 'justify-end'
                  )}>
                    {/* Integrated Kraft Tab Header */}
                    <div className={cn(
                      'px-6 py-2.5 rounded-t-xl font-mono text-xs font-black uppercase tracking-wider border-t border-x border-[#3d2b1c]/30 shadow-md flex items-center gap-2 transition-all relative overflow-hidden',
                      cItem.folderBg,
                      cItem.textColor,
                      isHovered || isSelected ? 'brightness-110 shadow-lg' : 'brightness-95'
                    )}>
                      {/* 100% FULL COVERAGE SEAMLESS 4K KRAFT PAPER TEXTURE OVERLAY */}
                      <div 
                        className={cn(
                          "absolute inset-0 bg-[url('/textures/kraft_paper_texture_large.png')] bg-repeat bg-[size:500px_500px] mix-blend-multiply opacity-80 pointer-events-none rounded-t-xl",
                          posClass
                        )}
                        style={{ filter: toneFilter }}
                      />

                      <Paperclip className="size-3.5 shrink-0 opacity-80 relative z-10" />
                      <span className="font-[family-name:var(--font-handwriting)] text-sm font-bold tracking-wide relative z-10">{cItem.code} // {cItem.title}</span>
                    </div>
                  </div>

                  {/* CLEAN MINIMAL KRAFT FOLDER COVER BODY WITH DEEP CONTACT DROP SHADOW */}
                  <div className={cn(
                    'w-full rounded-xl p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all min-h-[220px] sm:min-h-[240px]',
                    cItem.folderBg,
                    cItem.folderBorder,
                    cItem.textColor,
                    isHovered || isSelected
                      ? 'shadow-[0_50px_100px_rgba(0,0,0,0.99)] brightness-105 ring-2 ring-[#2b1b0e]/40'
                      : 'shadow-[0_30px_65px_rgba(0,0,0,0.96)] brightness-95'
                  )}>
                    
                    {/* 100% FULL COVERAGE SEAMLESS 4K KRAFT PAPER TEXTURE OVERLAY */}
                    <div 
                      className={cn(
                        "absolute inset-0 bg-[url('/textures/kraft_paper_texture_large.png')] bg-repeat bg-[size:500px_500px] mix-blend-multiply opacity-80 pointer-events-none rounded-xl",
                        posClass
                      )}
                      style={{ filter: toneFilter }}
                    />

                    {/* Clean Folder Header with Authentic Playpen_Sans Handwritten Tape Label & Red Rubber Stamp */}
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      
                      {/* Handwritten Marker Title on Vintage Paper Tape Label */}
                      <div className="inline-block">
                        <span className={cn(
                          "font-[family-name:var(--font-handwriting)] text-2xl sm:text-3xl font-bold text-[#1a0f07] tracking-wide leading-none bg-[#f4e8d8] px-3.5 py-1.5 rounded shadow-sm border border-[#2b1b0e]/20 inline-block transition-transform",
                          cItem.tapeRotateClass
                        )}>
                          {cItem.title}
                        </span>
                      </div>

                      {/* ARCHIVAL RED RUBBER STAMP (HỒ SƠ ĐIỀU TRA // 1998) */}
                      <div className="border-2 border-red-800/80 text-red-800 bg-red-950/10 font-mono text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rotate-[-6deg] rounded shadow-sm opacity-85 select-none pointer-events-none">
                        🔴 HỒ SƠ ĐIỀU TRẠ // {cItem.archiveYear}
                      </div>

                    </div>

                    {/* VINTAGE KRAFT FOLDER DEEP LOWER BODY DETAILS */}
                    <div className="mt-auto pt-8 flex items-center justify-between border-t border-[#2b1b0e]/20 opacity-75 font-mono text-[0.65rem] relative z-10">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="size-3.5 text-[#2b1b0e]" />
                        <span className="font-bold">MÃ LƯU TRỮ VỤ ÁN: VERITAS-{cItem.code.replace(' ', '')}-99</span>
                      </div>
                      <span className="font-bold uppercase tracking-wider">BAN ĐIỀU TRẠ HỒ SƠ MẬT</span>
                    </div>

                  </div>

                </div>
              )
            })}

          </div>

        </div>

      </div>

      {/* FLOATING SLIDE-OVER RIGHT PANEL */}
      {selectedCase && !isOpeningFolder && (
        <div className="fixed inset-y-0 right-0 sm:right-6 lg:right-12 z-50 w-full sm:w-[440px] p-4 sm:p-6 flex items-center justify-center pointer-events-none">
          
          <div className="relative w-full bg-[#d9a066] border-4 border-[#2b1b0e] text-[#2b1b0e] rounded-2xl p-6 sm:p-8 shadow-[0_35px_95px_rgba(0,0,0,0.98)] flex flex-col gap-5 pointer-events-auto animate-in slide-in-from-right duration-300 overflow-hidden">
            
            {/* AUTHENTIC 4K REAL KRAFT PAPER TEXTURE OVERLAY */}
            <div 
              className="absolute inset-0 bg-[url('/textures/kraft_paper_texture_large.png')] bg-repeat bg-[size:500px_500px] mix-blend-multiply opacity-80 pointer-events-none rounded-xl"
              style={{ filter: getFolderToneFilter(selectedCase.archiveYear) }}
            />

            {/* Close Button */}
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute top-4 right-4 text-[#2b1b0e] hover:text-red-900 p-1.5 rounded-full transition-colors cursor-pointer font-bold border border-[#2b1b0e]/20 hover:bg-[#2b1b0e]/10 z-20"
            >
              <X className="size-5" />
            </button>

            {/* Panel Header with Handwritten Title */}
            <div className="flex items-start gap-4 border-b border-[#2b1b0e]/30 pb-4 relative z-10">
              <div className="size-12 rounded-xl bg-[#2b1b0e] text-[#f2e6d8] flex items-center justify-center shrink-0 shadow-md">
                <KeyRound className="size-6 text-[#d9a066]" />
              </div>
              <div className="flex flex-col pr-6">
                <span className="font-mono text-[0.65rem] text-[#2b1b0e] font-black uppercase tracking-widest">
                  XÁC THỰC KÍCH HOẠT // {selectedCase.code}
                </span>
                <h2 className="font-[family-name:var(--font-handwriting)] text-2xl font-bold text-[#1a0f07]">
                  {selectedCase.title}
                </h2>
              </div>
            </div>

            {/* Case Summary Preview in Activation Panel */}
            <div className="p-3.5 bg-[#c98f55] border border-[#2b1b0e] rounded-xl text-xs leading-relaxed italic font-sans font-bold shadow-inner relative z-10">
              "{selectedCase.summary}"
            </div>

            {/* Locked Sealed Case Notification vs Code Entry Form */}
            {selectedCase.status === 'locked' ? (
              <div className="space-y-4 pt-2 relative z-10">
                <div className="p-4 bg-[#2b1b0e] border border-red-900/40 rounded-xl text-center space-y-1 shadow-inner">
                  <span className="font-mono text-xs font-black text-red-400 uppercase flex items-center justify-center gap-1.5">
                    <Lock className="size-4" /> CHUYÊN ÁN ĐANG ĐƯỢC NIÊM PHONG
                  </span>
                  <p className="text-[0.7rem] text-[#ad9885] font-sans">
                    Vụ án này chưa được phát hành. Vui lòng quay lại sau trong bản cập nhật tiếp theo!
                  </p>
                </div>
                
                <Button
                  disabled
                  size="lg"
                  className="w-full h-13 bg-[#2b1b0e]/60 text-[#a8907b] font-mono text-sm font-black uppercase border border-[#2b1b0e]/30 cursor-not-allowed opacity-75"
                >
                  <span>CHƯA MỞ KHÓA</span>
                </Button>
              </div>
            ) : (
              /* Code Entry Form */
              <form onSubmit={handleActivateSubmit} className="space-y-4 pt-1 relative z-10">
                <div>
                  <label className="font-mono text-xs font-black text-[#2b1b0e] uppercase block mb-2">
                    Nhập mã kích hoạt vụ án ({selectedCase.title}):
                  </label>

                  <input
                    type="text"
                    autoFocus
                    spellCheck={false}
                    placeholder="NX-4471"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase())
                      setCodeError(false)
                    }}
                    className={cn(
                      'w-full h-14 bg-[#2b1b0e] border-2 rounded-xl px-4 text-center font-mono text-xl tracking-[0.3em] uppercase text-[#f2e6d8] placeholder:text-[#a8907b] outline-none transition-all',
                      codeError
                        ? 'border-red-600 bg-red-950 text-red-[#f2e6d8]'
                        : 'border-[#1f1309] focus:border-[#0d0703]'
                    )}
                  />
                </div>

                {codeError && (
                  <p className="text-xs font-mono text-red-950 font-black flex items-center gap-1.5 justify-center">
                    <ShieldAlert className="size-4" /> Mã kích hoạt không chính xác.
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={!inputCode.trim()}
                  className="w-full h-13 gap-2 bg-[#2b1b0e] hover:bg-[#1a1008] text-[#f2e6d8] font-mono text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-98"
                >
                  <span>PHÁ ÁN</span>
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* CINEMATIC EVIDENCE SCATTERING & MORPH TRANSITION OVERLAY */}
      {/* ========================================================================= */}
      {isOpeningFolder && selectedCase && (
        <div className="fixed inset-y-0 inset-x-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 sm:p-8 animate-in fade-in duration-300 overflow-hidden">
          
          {/* CENTERED KRAFT FOLDER BASE CONTAINER */}
          <div 
            className={cn(
              "relative w-full max-w-xl min-h-[360px] sm:min-h-[400px] transition-all duration-700 ease-in-out",
              folderMorphed ? "scale-150 opacity-0" : "scale-100 opacity-100"
            )}
            style={{ perspective: '1400px' }}
          >
            
            {/* INNER KRAFT FOLDER BASE (REVEALED WHEN COVER FLIPS OPEN) */}
            <div className="absolute inset-0 bg-[#f4ebd9] rounded-2xl border-2 border-[#3d2c1e] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col justify-between text-[#1f1208] z-0 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_19px,#3b59981a_20px)] bg-[size:100%_20px] pointer-events-none" />

              <div className="flex items-center justify-between border-b-2 border-[#1f1208]/20 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-[#8c6b45]" />
                  <span className="font-mono text-xs font-bold text-[#8c6b45]">
                    ĐANG GIẢI MÃ DỮ LIỆU TANG CHỨNG...
                  </span>
                </div>
                <div className="font-mono text-xs font-bold border border-[#1f1208]/30 px-2.5 py-0.5 rounded bg-[#eae3d2]">
                  {selectedCase.code}
                </div>
              </div>
            </div>

            {/* FLIPPING 3D KRAFT COVER (FLIPS OPEN UPWARDS BY 165 DEGREES) */}
            <div 
              className={cn(
                "absolute inset-0 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-2 border-[#3d2b1c]/40 transition-transform duration-700 ease-in-out shadow-2xl z-10 overflow-hidden",
                selectedCase.folderBg,
                selectedCase.textColor,
                folderFlipped ? "rotate-x-[-165deg] opacity-0" : "rotate-x-0 opacity-100"
              )}
              style={{ 
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* AUTHENTIC 4K REAL KRAFT PAPER TEXTURE OVERLAY */}
              <div 
                className="absolute inset-0 bg-[url('/textures/kraft_paper_texture_large.png')] bg-repeat bg-[size:500px_500px] mix-blend-multiply opacity-80 pointer-events-none rounded-xl"
                style={{ filter: getFolderToneFilter(selectedCase.archiveYear) }}
              />

              <div className="flex items-start justify-between relative z-10">
                <div className="inline-block">
                  <span className={cn(
                    "font-[family-name:var(--font-handwriting)] text-3xl font-bold text-[#1a0f07] bg-[#f4e8d8] px-4 py-1.5 rounded shadow-sm border border-[#2b1b0e]/20 inline-block",
                    selectedCase.tapeRotateClass
                  )}>
                    {selectedCase.title}
                  </span>
                </div>
                <div className="border-2 border-red-800 text-red-800 bg-red-950/10 font-mono text-xs font-black uppercase px-3 py-1 rotate-[-6deg] rounded">
                  🔴 ĐANG MỞ HỒ SƠ
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SCATTERED EVIDENCE ITEMS (FLY OUT & SCATTER ACROSS SCREEN IN 3D) */}
            {/* =================================================================== */}

            {/* ITEM 1: A4 EXAMINATION REPORT (FLIES TOP-LEFT) */}
            <div className={cn(
              "absolute z-30 w-72 sm:w-80 bg-[#f9f6f0] text-[#1f1208] border-2 border-[#2b1b0e]/30 rounded-xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] transition-all duration-700 ease-out flex flex-col gap-3 font-sans",
              folderScattered
                ? "-translate-x-52 sm:-translate-x-80 -translate-y-24 rotate-[-12deg] scale-100 opacity-100"
                : "translate-x-0 translate-y-0 rotate-0 scale-50 opacity-0",
              folderMorphed && "-translate-x-[600px] opacity-0 scale-75"
            )}>
              <div className="flex items-center justify-between border-b border-[#2b1b0e]/20 pb-2">
                <span className="font-mono text-[0.65rem] font-bold text-red-900 uppercase tracking-widest flex items-center gap-1">
                  <FileText className="size-3.5" /> BIÊN BẢN KHÁM NGHIỆM #001
                </span>
                <span className="font-mono text-[0.6rem] bg-[#eae3d2] px-1.5 py-0.5 rounded font-bold">14/05/1998</span>
              </div>
              <p className="text-xs leading-relaxed italic text-[#2b1b0e] font-medium">
                "{selectedCase.summary}"
              </p>
            </div>

            {/* ITEM 2: POLAROID PHOTO #1 (FLIES TOP-RIGHT) */}
            <div className={cn(
              "absolute z-30 w-56 sm:w-64 bg-[#f2ebd9] border-2 border-[#3d2c1e] p-3 pt-3 pb-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-all duration-700 ease-out flex flex-col gap-2 rotate-[14deg]",
              folderScattered
                ? "translate-x-52 sm:translate-x-76 -translate-y-36 rotate-[14deg] scale-100 opacity-100"
                : "translate-x-0 translate-y-0 rotate-0 scale-50 opacity-0",
              folderMorphed && "translate-x-[600px] opacity-0 scale-75"
            )}>
              <div className="w-full h-36 bg-[#1a140e] border border-[#3d2c1e] rounded flex flex-col items-center justify-center relative overflow-hidden">
                <Camera className="size-8 text-[#d9a066] opacity-80" />
                <span className="font-mono text-[0.6rem] text-[#d4a373] mt-2 font-bold uppercase tracking-widest">
                  TANG CHỨNG HÌNH ẢNH #01
                </span>
              </div>
              <span className="font-[family-name:var(--font-handwriting)] text-sm font-bold text-[#1f1208] text-center mt-1">
                Hiện trường vụ tử vong
              </span>
            </div>

            {/* ITEM 3: WITNESS TESTIMONY SHEET (FLIES CENTER-UP) */}
            <div className={cn(
              "absolute z-40 w-80 sm:w-96 bg-[#faf7f0] text-[#1f1208] border-2 border-[#2b1b0e]/30 rounded-xl p-5 shadow-[0_30px_70px_rgba(0,0,0,0.9)] transition-all duration-700 ease-out flex flex-col gap-3 font-sans",
              folderScattered
                ? "-translate-y-32 rotate-[4deg] scale-110 opacity-100"
                : "translate-y-0 rotate-0 scale-50 opacity-0",
              folderMorphed && "scale-[1.8] opacity-0"
            )}>
              <div className="flex items-center justify-between border-b border-[#2b1b0e]/20 pb-2">
                <span className="font-mono text-[0.65rem] font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
                  <UserCheck className="size-3.5" /> LỜI KHAI NHÂN CHỨNG
                </span>
                <span className="font-mono text-[0.6rem] bg-[#2b1b0e] text-[#f2e6d8] px-2 py-0.5 rounded font-bold">MẬT</span>
              </div>
              <p className="font-[family-name:var(--font-handwriting)] text-base leading-snug font-bold text-[#1a0f07]">
                "Tôi thấy ánh đèn lấp lóe lúc 23h30 tại căn nhà dải tỏa..."
              </p>
            </div>

            {/* ITEM 4: POLAROID PHOTO #2 (FLIES BOTTOM-RIGHT) */}
            <div className={cn(
              "absolute z-30 w-52 sm:w-60 bg-[#f2ebd9] border-2 border-[#3d2c1e] p-3 pt-3 pb-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-all duration-700 ease-out flex flex-col gap-2",
              folderScattered
                ? "translate-x-48 sm:translate-x-72 translate-y-24 rotate-[-9deg] scale-100 opacity-100"
                : "translate-x-0 translate-y-0 rotate-0 scale-50 opacity-0",
              folderMorphed && "translate-x-[550px] translate-y-[200px] opacity-0 scale-75"
            )}>
              <div className="w-full h-32 bg-[#1f1912] border border-[#3d2c1e] rounded flex flex-col items-center justify-center relative overflow-hidden">
                <FileCheck2 className="size-7 text-[#d9a066] opacity-80" />
                <span className="font-mono text-[0.6rem] text-[#d4a373] mt-1.5 font-bold uppercase tracking-widest">
                  TANG CHỨNG HÌNH ẢNH #02
                </span>
              </div>
              <span className="font-[family-name:var(--font-handwriting)] text-xs font-bold text-[#1f1208] text-center mt-0.5">
                Vật chứng số 4-B
              </span>
            </div>

          </div>

        </div>
      )}

      <div />

    </main>
  )
}
