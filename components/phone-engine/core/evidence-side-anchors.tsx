"use client";

import React from "react";
import { useEvidenceAnchors } from "./evidence-anchor-context";

/**
 * Hiển thị dải thẻ mã chứng cứ chạy dọc bên phải điện thoại.
 * Thẻ mã tự động trượt theo tọa độ Y của dòng tương ứng khi người chơi scroll bên trong.
 */
export function EvidenceSideAnchors() {
  const anchorCtx = useEvidenceAnchors();

  if (!anchorCtx) return null;

  const { anchors } = anchorCtx;
  const list = Object.values(anchors).filter((a) => a.visible);

  return (
    <div className="absolute left-full top-[84px] h-[600px] w-28 pointer-events-none select-none z-30">
      {list.map((anchor) => {
        // Clamp top để không tràn ra ngoài màn hình
        const clampedTop = Math.max(12, Math.min(588, anchor.top));

        return (
          <div
            key={anchor.id}
            style={{
              top: `${clampedTop}px`,
            }}
            className="absolute left-0 -translate-y-1/2 flex items-center transition-all duration-75 ease-out pointer-events-none"
          >
            {/* Đường gióng kết nối từ mép bezel điện thoại */}
            <div className="w-3.5 h-[1.5px] bg-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />

            {/* Thẻ mã chứng cứ phong cách Minimal Tactical Tag: không viền, không copy, chữ to rõ */}
            <div
              className="ml-0.5 px-2 py-0.5 rounded-sm flex items-center bg-[#1A1A1E]/95 text-red-400 shadow-[0_2px_8px_rgba(0,0,0,0.5)] font-mono text-[12px] tracking-wider uppercase font-extrabold"
            >
              <span className="leading-none">{anchor.id}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
