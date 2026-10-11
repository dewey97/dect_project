"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Info,
  Lightbulb,
  SunMedium,
  Sliders,
  Maximize2,
} from "lucide-react";
import Link from "next/link";

interface PinItem {
  id: string;
  x: number; // Tọa độ % trong mặt bảng
  y: number; // Tọa độ % trong mặt bảng
  title: string;
  type: "note" | "phone";
  noteUrl?: string;
  pinnedTo?: string; // Nối dây chỉ tới ID khác
  rotation?: number; // Độ nghiêng tự nhiên (-5 đến 5 deg)
}

const FIXED_PINS: PinItem[] = [
  {
    id: "pin-evidence",
    x: 23,
    y: 20,
    title: "BỔ SUNG CHỨNG CỨ",
    type: "note",
    noteUrl: "/images/cases/case_000/clue_notes/rendered_notes/note_bo_sung_chung_cu.png",
    pinnedTo: "pin-phone",
    rotation: -1.5,
  },
  {
    id: "pin-question",
    x: 52,
    y: 18,
    title: "NGHI VẤN VỤ ÁN",
    type: "note",
    noteUrl: "/images/cases/case_000/clue_notes/rendered_notes/note_nghi_van.png",
    pinnedTo: "pin-suspects",
    rotation: 2.2,
  },
  {
    id: "pin-suspects",
    x: 77,
    y: 30,
    title: "NGHI PHẠM (TÙNG, HÀ, VŨ...)",
    type: "note",
    noteUrl: "/images/cases/case_000/clue_notes/rendered_notes/note_nghi_pham.png",
    rotation: -2.8,
  },
  {
    id: "pin-phone",
    x: 48,
    y: 38,
    title: "MỞ RỘNG ĐIỀU TRA (ĐIỆN THOẠI KHANG)",
    type: "phone",
    noteUrl: "/images/cases/case_000/phone/victim_phone_node.png",
    pinnedTo: "pin-reinvestigate",
    rotation: 1.2,
  },
  {
    id: "pin-reinvestigate",
    x: 25,
    y: 52,
    title: "BIÊN BẢN KHÁM XÉT LẠI",
    type: "note",
    noteUrl: "/images/cases/case_000/clue_notes/rendered_notes/note_kham_xet_lai.png",
    pinnedTo: "pin-indictment",
    rotation: -1.8,
  },
  {
    id: "pin-indictment",
    x: 35,
    y: 78,
    title: "BẢN KẾT LUẬN ĐIỀU TRA",
    type: "note",
    noteUrl: "/images/cases/case_000/clue_notes/rendered_notes/note_ket_luan_dieu_tra.png",
    rotation: 0.8,
  },
];

export default function BoardStagePage() {
  const [activePin, setActivePin] = useState<PinItem | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [lampAngle, setLampAngle] = useState(50); // Điểm phát sáng: 30% (trái) -> 50% (giữa) -> 70% (phải)
  const [coneSpread, setConeSpread] = useState(65); // Độ loang của nón ánh sáng (40-90%)
  const [lampIntensity, setLampIntensity] = useState(85); // 20% -> 100%
  const [showControls, setShowControls] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Helper tính SVG line giữa các pin
  const renderEvidenceStrings = () => {
    return FIXED_PINS.filter((p) => p.pinnedTo).map((p) => {
      const target = FIXED_PINS.find((t) => t.id === p.pinnedTo);
      if (!target) return null;

      const midX = (p.x + target.x) / 2;
      const midY = (p.y + target.y) / 2 + 3.2;

      return (
        <g key={`${p.id}-${target.id}`}>
          {/* Bóng đổ sợi chỉ */}
          <path
            d={`M ${p.x}% ${p.y}% Q ${midX}% ${midY + 0.6}% ${target.x}% ${target.y}%`}
            fill="none"
            stroke="rgba(10, 5, 2, 0.55)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Sợi chỉ đỏ Crimson Yarn */}
          <path
            d={`M ${p.x}% ${p.y}% Q ${midX}% ${midY}% ${target.x}% ${target.y}%`}
            fill="none"
            stroke="#dc2626"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="filter drop-shadow-[0_1px_2px_rgba(220,38,38,0.35)]"
          />
        </g>
      );
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070503] flex flex-col items-center justify-between select-none">
      {/* ─────────────────────────────────────────────────────────────
          NAVBAR ĐIỀU KHIỂN & THANH CÔNG CỤ LAB
      ───────────────────────────────────────────────────────────── */}
      <header className="z-50 w-full max-w-md px-3 py-2.5 flex items-center justify-between bg-black/75 backdrop-blur-md border-b border-amber-950/40 text-stone-300 text-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về sảnh</span>
        </Link>

        <div className="flex items-center gap-1 font-mono text-[11px] text-amber-500 font-semibold tracking-wider uppercase">
          <span>STAGE [MOBILE MOCKUP]</span>
        </div>

        {/* Cụm công cụ tùy chỉnh đèn và zoom */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowControls((prev) => !prev)}
            title="Tùy chỉnh nón ánh sáng chiếu từ trên xuống"
            className={`p-1.5 rounded-md border transition-all ${
              showControls
                ? "bg-amber-600/30 text-amber-300 border-amber-500"
                : "bg-stone-900 text-stone-400 border-stone-800 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setLampOn((prev) => !prev)}
            title="Bật/Tắt đèn bàn"
            className={`p-1.5 rounded-md border transition-all ${
              lampOn
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                : "bg-stone-900 text-stone-500 border-stone-800"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => (z === 1 ? 1.22 : 1))}
            title="Zoom cận cảnh"
            className="p-1.5 rounded-md bg-stone-900 text-stone-400 border border-stone-800 hover:text-white"
          >
            {zoomLevel === 1 ? (
              <ZoomIn className="w-3.5 h-3.5" />
            ) : (
              <ZoomOut className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          BẢNG ĐIỀU KHIỂN NÓN ÁNH SÁNG (LIGHT CONTROLS DRAWER)
      ───────────────────────────────────────────────────────────── */}
      {showControls && (
        <div className="z-50 w-full max-w-md px-4 py-3 bg-stone-950/95 border-b border-amber-900/40 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-mono text-amber-400 uppercase font-semibold mb-2 flex items-center justify-between">
            <span>Tùy chỉnh Nón Ánh Sáng Đỉnh (Top Light Cone)</span>
            <span className="text-[10px] text-stone-400 font-normal">Realtime CSS Cone</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-[10px] text-stone-300">
            <div>
              <span className="text-stone-400 block mb-1">Góc chiếu: {lampAngle}%</span>
              <input
                type="range"
                min="20"
                max="80"
                value={lampAngle}
                onChange={(e) => setLampAngle(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-800 rounded"
              />
            </div>
            <div>
              <span className="text-stone-400 block mb-1">Độ mở nón: {coneSpread}%</span>
              <input
                type="range"
                min="40"
                max="90"
                value={coneSpread}
                onChange={(e) => setConeSpread(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-800 rounded"
              />
            </div>
            <div>
              <span className="text-stone-400 block mb-1">Cường độ: {lampIntensity}%</span>
              <input
                type="range"
                min="20"
                max="100"
                value={lampIntensity}
                onChange={(e) => setLampIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-800 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE VIEWPORT: TỶ LỆ CHUẨN ĐIỆN THOẠI (9:16 DỌC)
      ───────────────────────────────────────────────────────────── */}
      <main className="relative flex-1 w-full max-w-[440px] flex items-center justify-center p-2.5 sm:p-4 overflow-hidden">
        {/* LỚP 1: BỐI CẢNH NGOÀI KHUNG (Room / Antique Detective Desk) */}
        <div className="absolute inset-0 bg-[#080503] pointer-events-none overflow-hidden">
          {/* Ảnh nền mặt bàn thám tử cao cấp với sổ tay, đèn bàn ngoài viền */}
          <Image
            src="/images/backgrounds/detective_desk_ambient_vertical.jpg"
            alt="Mặt bàn điều tra"
            fill
            priority
            className="object-cover opacity-60 filter blur-[1.5px] scale-105"
          />
          {/* Lớp bóng đen bao quanh rìa mép ngoài */}
          <div className="absolute inset-0 bg-radial-vignette opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950/90" />
        </div>

        {/* ──────────────────────────────────────────────────────────
            LỚP 2: VỎ KHUNG BẢNG GỖ CAO CẤP (Vintage Wooden Frame)
            Tỉ lệ chuẩn 9:16 - Chứa chất liệu vân gỗ thật và nẹp góc kim loại
        ────────────────────────────────────────────────────────── */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transition: "transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className="relative w-full aspect-[9/16] max-h-full rounded-xl transition-transform duration-300 origin-center
                     shadow-[0_25px_65px_rgba(0,0,0,0.98),_0_0_0_1px_rgba(255,255,255,0.06),_0_2px_4px_rgba(0,0,0,0.8)]
                     overflow-hidden"
        >
          {/* Hình ảnh Khung gỗ vintage thực tế với nẹp góc đồng già */}
          <Image
            src="/images/backgrounds/vintage_framed_corkboard_vertical.jpg"
            alt="Khung bảng gỗ nẹp đồng"
            fill
            priority
            className="object-cover pointer-events-none"
          />

          {/* ──────────────────────────────────────────────────────────
              LỚP 3: LÒNG BẢNG GHIM (Corkboard Surface Core Area)
              Nằm lọt lòng chính xác bên trong đường viền khung gỗ
          ────────────────────────────────────────────────────────── */}
          <div
            className="absolute inset-[13.5%_12.8%_13.2%_12.8%] rounded-sm overflow-hidden 
                       shadow-[inset_0_8px_20px_rgba(0,0,0,0.85),_inset_0_-8px_20px_rgba(0,0,0,0.7),_inset_8px_0_15px_rgba(0,0,0,0.8),_inset_-8px_0_15px_rgba(0,0,0,0.8)]"
          >
            {/* Texture nỉ gỗ bần siêu nét (Pure macro cork grain) */}
            <Image
              src="/images/backgrounds/pure_cork_texture_vertical.jpg"
              alt="Mặt gỗ bần ghim tài liệu"
              fill
              className="object-cover pointer-events-none opacity-90 filter contrast-110"
            />

            {/* Bóng đổ tiếp xúc từ rãnh khung gỗ vào lòng nỉ (Rãnh khắc sâu 3D) */}
            <div className="absolute inset-0 shadow-[inset_0_0_25px_rgba(15,8,3,0.9)] pointer-events-none" />

            {/* ──────────────────────────────────────────────────────
                LỚP DÂY CHỈ ĐỎ (SVG Strings Layer - Cố định giữa các ghim)
            ────────────────────────────────────────────────────── */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }}
            >
              {renderEvidenceStrings()}
            </svg>

            {/* ──────────────────────────────────────────────────────
                LỚP CÁC PHẦN TỬ VẬT CHỨNG (Fixed Pins & Evidence Notes)
            ────────────────────────────────────────────────────── */}
            {FIXED_PINS.map((pin) => {
              const isPhone = pin.type === "phone";
              const isSelected = activePin?.id === pin.id;

              return (
                <div
                  key={pin.id}
                  onClick={() => setActivePin(pin)}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: `translate(-50%, -50%) rotate(${pin.rotation || 0}deg) ${
                      isSelected ? "scale(1.08)" : ""
                    }`,
                  }}
                  className={`absolute z-20 cursor-pointer transition-transform duration-200 group active:scale-95`}
                >
                  {/* Đầu ghim bấm 3D (Pushpin) */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-950 shadow-[0_2px_4px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.7)]" />
                    <div className="w-2 h-1 bg-black/50 rounded-full blur-[0.5px] -mt-0.5" />
                  </div>

                  {/* Thẻ vật chứng: Giấy Note hoặc Túi Điện Thoại */}
                  {isPhone ? (
                    <div className="relative w-20 h-32 sm:w-24 sm:h-36 rounded-md p-1 bg-neutral-900/40 border border-stone-600/30 backdrop-blur-[1px] shadow-[0_8px_18px_rgba(0,0,0,0.85)] group-hover:shadow-[0_12px_24px_rgba(245,158,11,0.3)] transition-shadow">
                      <Image
                        src={pin.noteUrl || ""}
                        alt={pin.title}
                        fill
                        className="object-contain p-1"
                      />
                      <div className="absolute bottom-1 inset-x-1 text-center bg-black/80 rounded text-[7.5px] font-mono text-amber-300 py-0.5 font-bold truncate">
                        TANG VẬT #01
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-24 h-16 sm:w-28 sm:h-20 rounded shadow-[0_6px_14px_rgba(0,0,0,0.75)] group-hover:shadow-[0_10px_22px_rgba(245,158,11,0.35)] transition-shadow overflow-hidden bg-[#faf8f2]">
                      {pin.noteUrl ? (
                        <Image
                          src={pin.noteUrl}
                          alt={pin.title}
                          fill
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <div className="w-full h-full p-2 flex flex-col justify-between text-[#26180d]">
                          <span className="font-bold text-[8.5px] uppercase tracking-tighter">
                            {pin.title}
                          </span>
                          <span className="font-mono text-[7px] text-stone-600 italic">
                            [Chạm để xem]
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Viền sáng nhấp nháy khi chọn */}
                  {isSelected && (
                    <div className="absolute -inset-1.5 rounded-lg border-2 border-dashed border-amber-400 pointer-events-none animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* ──────────────────────────────────────────────────────────
              LỚP 4: NÓN ÁNH SÁNG ĐÈN BÀN CHIẾU TỪ TRÊN XUỐNG (The Light Cone)
              - Tạo hình nón rọi thật (Conic & Radial Spotlight)
              - pointer-events: none (người chơi tương tác xuyên thấu 100%)
          ────────────────────────────────────────────────────────── */}
          {lampOn && (
            <div
              className="absolute inset-0 pointer-events-none z-30 transition-all duration-300 overflow-hidden"
              style={{
                // Nón ánh sáng chao đồng thực tế: Đỉnh nón hẹp ở trên mép đỉnh, mở rộng dần dạng hình nón xuống đáy
                background: `
                  /* 1. Tia sáng hình nón chính (Light Cone Beam) */
                  conic-gradient(
                    from 180deg at ${lampAngle}% 0%,
                    transparent ${90 - coneSpread / 2}deg,
                    rgba(255, 235, 175, ${(0.22 * lampIntensity) / 100}) ${90 - coneSpread / 4}deg,
                    rgba(255, 245, 210, ${(0.32 * lampIntensity) / 100}) 90deg,
                    rgba(255, 235, 175, ${(0.22 * lampIntensity) / 100}) ${90 + coneSpread / 4}deg,
                    transparent ${90 + coneSpread / 2}deg
                  ),
                  /* 2. Quầng sáng tỏa mềm (Soft Radial Ambient) */
                  radial-gradient(
                    ellipse ${coneSpread + 15}% 70% at ${lampAngle}% 8%,
                    rgba(255, 245, 200, ${(0.35 * lampIntensity) / 100}) 0%,
                    rgba(245, 210, 130, ${(0.18 * lampIntensity) / 100}) 40%,
                    rgba(20, 10, 5, 0.45) 75%,
                    rgba(5, 2, 1, 0.92) 100%
                  )
                `,
                mixBlendMode: "screen",
              }}
            >
              {/* Bóng tối chìm dần ở đáy bảng và 2 góc dưới */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Màn đêm bao trùm khi tắt đèn */}
          {!lampOn && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-[0.5px] pointer-events-none z-30 transition-opacity duration-500" />
          )}
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER: BẢNG TIN CHI TIẾT TÀI LIỆU KHI CHẠM
      ───────────────────────────────────────────────────────────── */}
      <footer className="z-40 w-full max-w-md p-3 bg-stone-950/95 border-t border-stone-800/90 backdrop-blur-md">
        {activePin ? (
          <div className="flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-amber-500 uppercase font-semibold">
                Đang kiểm tra tài liệu
              </span>
              <h4 className="text-xs font-bold text-stone-200 truncate">
                {activePin.title}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePin(null)}
                className="px-2.5 py-1 rounded bg-stone-800 text-stone-300 text-xs hover:bg-stone-700"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-stone-500 text-xs italic">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Chạm vào bất kỳ giấy note hay tang vật nào để kiểm tra</span>
          </div>
        )}
      </footer>
    </div>
  );
}
