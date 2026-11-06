"use client";

import React from "react";
import {
  ChevronRight,
  User,
  ArrowUp,
  ArrowDown,
  ClipboardPaste,
  X,
  Phone,
  Paperclip,
} from "lucide-react";
import type { DbPhoneMessage } from "@/lib/types/database";
import { slugifyVietnamese } from "@/lib/utils/text";
import {
  savePhoneMessagesBatch,
  deletePhoneThread,
  uploadPhoneAsset,
  type BatchMessageItemInput,
} from "@/lib/actions/phone-actions";

export interface MessagesPasteModalProps {
  setIsPasteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pasteRawText: string;
  setPasteRawText: React.Dispatch<React.SetStateAction<string>>;
  handleApplyPastedBlock: () => void;
}

export function MessagesPasteModal({
  setIsPasteModalOpen,
  pasteRawText,
  setPasteRawText,
  handleApplyPastedBlock,
}: MessagesPasteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <ClipboardPaste className="size-4 text-sky-400" />
                Dán khối văn bản hội thoại (Batch Paste)
              </h3>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-400 space-y-1">
              <p>Hỗ trợ các định dạng kịch bản phổ biến:</p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <li>Nam: Alo anh, tối nay có rảnh không? [20:15]</li>
                <li>&gt; Tôi: 9h tối tôi mới về đến nhà</li>
                <li>(20:20) Hà: Anh nhớ mua đồ ăn về nhé</li>
                <li>
                  Hoặc dán mảng JSON: [{`"sender": "Nam", "body": "..."`}]
                </li>
              </ul>
            </div>

            <textarea
              rows={8}
              value={pasteRawText}
              onChange={(e) => setPasteRawText(e.target.value)}
              placeholder="Dán khối văn bản kịch bản vào đây..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 font-mono focus:outline-none focus:border-sky-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyPastedBlock}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer"
              >
                Chèn vào bảng
              </button>
            </div>
          </div>
        </div>
  );
}
