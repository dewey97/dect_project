"use client";

import React from "react";
import { Smartphone } from "lucide-react";
import type { Checkpoint } from "@/lib/types";

interface CheckpointTextMatchFormProps {
  checkpoint: Checkpoint;
  hasSuccess: boolean;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

export function CheckpointTextMatchForm({
  checkpoint,
  hasSuccess,
  values,
  onChange,
}: CheckpointTextMatchFormProps) {
  return (
    <div className="space-y-4 pt-1">
      {/* ONBOARDING INITIAL EVIDENCE CALLOUT FOR CP-000-0 */}
      {checkpoint.id === "cp-000-0" && (
        <div className="p-3.5 bg-[#ebdcc4] border-2 border-[#a88c6f] rounded-none text-xs text-[#3b2b1a] space-y-2.5 shadow-sm">
          <p className="text-xs leading-relaxed">
            Trước tiên, bạn hãy đối chiếu dữ liệu giữa{" "}
            <strong>Hồ sơ tài liệu</strong> (Sổ nợ{" "}
            <code className="bg-[#dfccb0] px-1 py-0.5 rounded font-mono text-[#1a0f07]">
              10
            </code>
            , Bảng tin rao vặt{" "}
            <code className="bg-[#dfccb0] px-1 py-0.5 rounded font-mono text-[#1a0f07]">
              11
            </code>
            ) và <strong>Điện thoại nạn nhân Khang</strong> (Call Log{" "}
            <code className="bg-[#dfccb0] px-1 py-0.5 rounded font-mono text-[#1a0f07]">
              dev-00
            </code>
            ) để tìm ra danh tính 3 SĐT ẩn danh.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                window.dispatchEvent(new CustomEvent("open-phone-modal"));
              } catch {}
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2c1d12] hover:bg-[#3d291a] text-[#f4e8d8] font-mono text-xs font-bold transition-all cursor-pointer rounded-none shadow border border-[#523924]"
          >
            <Smartphone className="size-3.5 text-amber-400" />
            <span>📱 MỞ ĐIỆN THOẠI NẠN NHÂN KHANG</span>
          </button>
        </div>
      )}

      <span className="font-mono text-xs text-[#4a3520] uppercase font-bold tracking-wider block">
        ĐIỀN DANH TÍNH CHỦ THỂ THỤ LÝ SĐT VÀO Ô:
      </span>

      <div className="space-y-3">
        {checkpoint.textMatchConfig?.inputs.map((inp) => (
          <div key={inp.id} className="space-y-1">
            <label className="text-xs font-bold text-[#2b1f14] block">
              {inp.label}
            </label>
            <input
              type="text"
              disabled={hasSuccess}
              value={values[inp.id] || ""}
              onChange={(e) => onChange(inp.id, e.target.value)}
              className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-base text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
