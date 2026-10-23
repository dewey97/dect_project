"use client";

import React, { useState, useTransition } from "react";
import {
  FileText,
  CreditCard,
  Globe,
  Plus,
  Trash2,
  Key,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type {
  DbPhoneNote,
  DbPhoneBankTx,
  DbPhoneBrowserHistory,
} from "@/lib/types/database";
import {
  upsertPhoneNote,
  deletePhoneNote,
  upsertPhoneBankTransaction,
  deletePhoneBankTransaction,
  upsertPhoneBrowserHistory,
  deletePhoneBrowserHistory,
} from "@/lib/actions/phone-actions";

interface MiscEditorsProps {
  caseId: string;
  initialNotes: DbPhoneNote[];
  initialBankTxs: DbPhoneBankTx[];
  initialHistory: DbPhoneBrowserHistory[];
  onNotesChange: (notes: DbPhoneNote[]) => void;
  onBankChange: (txs: DbPhoneBankTx[]) => void;
  onHistoryChange: (history: DbPhoneBrowserHistory[]) => void;
}

export function MiscEditors({
  caseId,
  initialNotes,
  initialBankTxs,
  initialHistory,
  onNotesChange,
  onBankChange,
  onHistoryChange,
}: MiscEditorsProps) {
  const [subTab, setSubTab] = useState<"notes" | "bank" | "safari">("notes");
  const [notes, setNotes] = useState<DbPhoneNote[]>(initialNotes);
  const [bankTxs, setBankTxs] = useState<DbPhoneBankTx[]>(initialBankTxs);
  const [history, setHistory] =
    useState<DbPhoneBrowserHistory[]>(initialHistory);

  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{
    type: "idle" | "success" | "error";
    text?: string;
  }>({ type: "idle" });

  // 1. Notes Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteMeta, setNoteMeta] = useState("");
  const [noteTimestamp, setNoteTimestamp] = useState("2023-07-23 15:40");
  const [noteDamaged, setNoteDamaged] = useState(false);

  // 2. Bank Form State
  const [txType, setTxType] = useState<"in" | "out">("out");
  const [txAmount, setTxAmount] = useState<number>(5000000);
  const [txPartner, setTxPartner] = useState("");
  const [txNote, setTxNote] = useState("");
  const [txTime, setTxTime] = useState("2023-07-23 19:15");
  const [txIsClue, setTxIsClue] = useState(false);

  // 3. Safari Form State
  const [safariTitle, setSafariTitle] = useState("");
  const [safariUrl, setSafariUrl] = useState("");
  const [safariTime, setSafariTime] = useState("2023-07-23 20:30");
  const [safariIsClue, setSafariIsClue] = useState(false);

  // --- Handlers for Notes ---
  const handleAddNote = () => {
    if (!noteTitle.trim()) {
      alert("Vui lòng nhập tiêu đề ghi chú");
      return;
    }

    const nextSlot =
      notes.length > 0 ? Math.max(...notes.map((n) => n.slot_index)) + 1 : 0;

    startTransition(async () => {
      const res = await upsertPhoneNote({
        case_slug: caseId,
        title: noteTitle.trim(),
        body: noteContent.trim(),
        is_pinned: noteDamaged,
        slot_index: nextSlot,
      });

      if (res.success && res.data) {
        const updated = [...notes, res.data];
        setNotes(updated);
        onNotesChange(updated);
        setNoteTitle("");
        setNoteContent("");
        setNoteMeta("");
        setNoteDamaged(false);
        setStatusMsg({ type: "success", text: "Đã thêm ghi chú mới." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể thêm ghi chú.",
        });
      }
    });
  };

  const handleDeleteNote = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) return;
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    onNotesChange(filtered);

    startTransition(async () => {
      await deletePhoneNote(id);
    });
  };

  // --- Handlers for Bank Txs ---
  const handleAddBankTx = () => {
    if (!txPartner.trim()) {
      alert("Vui lòng nhập đối tác giao dịch");
      return;
    }

    const nextSlot =
      bankTxs.length > 0
        ? Math.max(...bankTxs.map((b) => b.slot_index)) + 1
        : 0;

    startTransition(async () => {
      const res = await upsertPhoneBankTransaction({
        case_slug: caseId,
        tx_type: txType,
        amount: Number(txAmount) || 0,
        counterparty: txPartner.trim(),
        note: txNote.trim() || null,
        timestamp: txTime.trim() || null,
        is_clue: txIsClue,
        slot_index: nextSlot,
      });

      if (res.success && res.data) {
        const updated = [...bankTxs, res.data];
        setBankTxs(updated);
        onBankChange(updated);
        setTxPartner("");
        setTxNote("");
        setTxIsClue(false);
        setStatusMsg({ type: "success", text: "Đã thêm giao dịch ngân hàng." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể thêm giao dịch.",
        });
      }
    });
  };

  const handleDeleteBankTx = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    const filtered = bankTxs.filter((b) => b.id !== id);
    setBankTxs(filtered);
    onBankChange(filtered);

    startTransition(async () => {
      await deletePhoneBankTransaction(id);
    });
  };

  // --- Handlers for Safari History ---
  const handleAddSafari = () => {
    if (!safariUrl.trim()) {
      alert("Vui lòng nhập địa chỉ URL trang web");
      return;
    }

    const nextSlot =
      history.length > 0
        ? Math.max(...history.map((h) => h.slot_index)) + 1
        : 0;

    startTransition(async () => {
      const res = await upsertPhoneBrowserHistory({
        case_slug: caseId,
        title: safariTitle.trim() || safariUrl.trim(),
        url: safariUrl.trim(),
        visited_at: safariTime.trim() || null,
        is_clue: safariIsClue,
        slot_index: nextSlot,
      });

      if (res.success && res.data) {
        const updated = [...history, res.data];
        setHistory(updated);
        onHistoryChange(updated);
        setSafariTitle("");
        setSafariUrl("");
        setSafariIsClue(false);
        setStatusMsg({ type: "success", text: "Đã thêm lịch sử duyệt web." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể thêm lịch sử.",
        });
      }
    });
  };

  const handleDeleteSafari = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi lịch sử này?")) return;
    const filtered = history.filter((h) => h.id !== id);
    setHistory(filtered);
    onHistoryChange(filtered);

    startTransition(async () => {
      await deletePhoneBrowserHistory(id);
    });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setSubTab("notes")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            subTab === "notes"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
          }`}
        >
          <FileText className="size-3.5" /> Ghi chú ({notes.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab("bank")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            subTab === "bank"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
          }`}
        >
          <CreditCard className="size-3.5" /> Ngân hàng ({bankTxs.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab("safari")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            subTab === "safari"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
          }`}
        >
          <Globe className="size-3.5" /> Safari ({history.length})
        </button>
      </div>

      {statusMsg.type === "success" && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}
      {statusMsg.type === "error" && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ────────────────── SUB-TAB 1: NOTES ────────────────── */}
      {subTab === "notes" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Danh sách ghi chú ({notes.length})
              </h3>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {notes.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  Chưa có ghi chú nào.
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 flex items-start justify-between hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-100">
                          {n.title}
                        </span>
                        {n.is_pinned && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-700/60">
                            Đã ghim
                          </span>
                        )}
                        {n.is_clue && (
                          <span className="text-[10px] text-red-400 bg-red-950/80 px-1.5 py-0.2 rounded border border-red-700/60">
                            Manh mối
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 whitespace-pre-wrap">
                        {n.body}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer shrink-0 ml-2"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Note Form */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300">
              Tạo ghi chú mới (Notes App)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tiêu đề ghi chú
                </label>
                <input
                  type="text"
                  placeholder="VD: Mật khẩu két sắt, Lịch hẹn..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Thời gian tạo
                </label>
                <input
                  type="text"
                  placeholder="2023-07-23 15:40"
                  value={noteTimestamp}
                  onChange={(e) => setNoteTimestamp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Nội dung ghi chú
              </label>
              <textarea
                rows={4}
                placeholder="Nội dung chi tiết của ghi chú..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-xs text-red-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noteDamaged}
                  onChange={(e) => setNoteDamaged(e.target.checked)}
                  className="accent-red-500 rounded"
                />
                Ghi chú bị rách / Bị xóa một phần (Damaged)
              </label>

              <button
                type="button"
                onClick={handleAddNote}
                disabled={isPending || !noteTitle.trim()}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" /> Thêm ghi chú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 2: BANK ────────────────── */}
      {subTab === "bank" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Lịch sử biến động số dư ({bankTxs.length})
              </h3>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {bankTxs.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  Chưa có giao dịch ngân hàng nào.
                </div>
              ) : (
                bankTxs.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 flex items-center justify-between hover:bg-zinc-800/40 transition-colors ${
                      b.is_clue ? "bg-amber-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-9 rounded-full flex items-center justify-center shrink-0 border ${
                          b.tx_type === "in"
                            ? "bg-emerald-950/60 border-emerald-600/60 text-emerald-400"
                            : "bg-red-950/60 border-red-600/60 text-red-400"
                        }`}
                      >
                        {b.tx_type === "in" ? (
                          <TrendingUp className="size-4" />
                        ) : (
                          <TrendingDown className="size-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-100">
                            {b.counterparty}
                          </span>
                          {b.is_clue && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/60 font-mono">
                              <Key className="size-2.5" /> MANH MỐI
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          {b.note && <span>{b.note}</span>}
                          {b.timestamp && (
                            <span className="text-zinc-500 font-mono">
                              • {b.timestamp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold font-mono ${
                          b.tx_type === "in"
                            ? "text-emerald-400"
                            : "text-zinc-100"
                        }`}
                      >
                        {b.tx_type === "in" ? "+" : "-"}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Number(b.amount) || 0)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteBankTx(b.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Bank Tx Form */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300">
              Thêm giao dịch ngân hàng mới
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Loại giao dịch
                </label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as "in" | "out")}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="out">Tiền ra (- Chuyển đi / Rút tiền)</option>
                  <option value="in">Tiền vào (+ Nhận chuyển khoản)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  step={10000}
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Đối tác giao dịch
                </label>
                <input
                  type="text"
                  placeholder="VD: Cty TNHH Sao Mai, Hoàng Minh..."
                  value={txPartner}
                  onChange={(e) => setTxPartner(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nội dung chuyển khoản
                </label>
                <input
                  type="text"
                  placeholder="VD: Chuyen tien dat coc hop dong..."
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Thời gian giao dịch
                </label>
                <input
                  type="text"
                  placeholder="2023-07-23 19:15"
                  value={txTime}
                  onChange={(e) => setTxTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={txIsClue}
                  onChange={(e) => setTxIsClue(e.target.checked)}
                  className="accent-amber-400 rounded"
                />
                <Key className="size-3.5 text-amber-400" />
                Đánh dấu giao dịch này là Manh mối phá án
              </label>

              <button
                type="button"
                onClick={handleAddBankTx}
                disabled={isPending || !txPartner.trim()}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" /> Thêm giao dịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 3: SAFARI ────────────────── */}
      {subTab === "safari" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Lịch sử duyệt web ({history.length})
              </h3>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {history.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  Chưa có lịch sử web nào.
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    className={`p-3 flex items-center justify-between hover:bg-zinc-800/40 transition-colors ${
                      h.is_clue ? "bg-amber-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center shrink-0 text-sky-400">
                        <Globe className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-100">
                            {h.title}
                          </span>
                          {h.is_clue && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/60 font-mono">
                              <Key className="size-2.5" /> MANH MỐI
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
                          <span className="text-sky-400/90 truncate max-w-[280px]">
                            {h.url}
                          </span>
                          {h.visited_at && (
                            <span className="text-zinc-500">
                              • {h.visited_at}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSafari(h.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                      title="Xóa lịch sử"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Safari History Form */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300">
              Thêm lịch sử duyệt web
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tiêu đề trang web
                </label>
                <input
                  type="text"
                  placeholder="VD: Tìm kiếm Google: mua vé tàu đi Hải Phòng..."
                  value={safariTitle}
                  onChange={(e) => setSafariTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Địa chỉ URL
                </label>
                <input
                  type="text"
                  placeholder="https://google.com/search?q=..."
                  value={safariUrl}
                  onChange={(e) => setSafariUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Thời gian truy cập
                </label>
                <input
                  type="text"
                  placeholder="2023-07-23 20:30"
                  value={safariTime}
                  onChange={(e) => setSafariTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-end pb-1.5">
                <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safariIsClue}
                    onChange={(e) => setSafariIsClue(e.target.checked)}
                    className="accent-amber-400 rounded"
                  />
                  <Key className="size-3.5 text-amber-400" />
                  Đánh dấu là Lịch sử duyệt web nghi vấn
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddSafari}
              disabled={isPending || !safariUrl.trim()}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus className="size-4" /> Thêm vào lịch sử web
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
