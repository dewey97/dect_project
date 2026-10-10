"use client";

import { useState } from "react";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  Calendar,
  Wallet,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";

interface BankingAppProps {
  onBackToHome?: () => void;
}

export function BankingApp({ onBackToHome }: BankingAppProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");

  const { data: sheetData, loading } = usePhoneData("banking");

  const transactions = sheetData.map((item: any, idx: number) => ({
    id: item.tx_id || `tx-${idx + 1}`,
    refId: item.ref_id || `FT${idx + 1000000}`,
    title: item.title || "Giao dịch ngân hàng",
    receiver: item.receiver || "Đối tác",
    accountNo: item.account_no || "Chưa rõ STK",
    amount: Number(item.amount) || 0,
    time: item.timestamp || "",
    category: item.category || "Chuyển khoản",
    note: item.note || "",
    isEvidence:
      String(item.is_evidence).toLowerCase() === "true" ||
      item.is_evidence === true,
  }));

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "in") return tx.amount > 0;
    if (filterType === "out") return tx.amount < 0;
    return true;
  });

  // Calculate balance based on transactions
  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const displayBalance = totalBalance > 0 ? totalBalance : 0;

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-white select-none overflow-hidden font-sans">
      {/* Top Bank Header */}
      <div className="px-4 pt-3 pb-2 bg-gradient-to-b from-[#161B26] to-[#0B0E14] border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 active:scale-95 cursor-pointer mr-0.5"
                title="Thoát ứng dụng về Màn hình chính"
              >
                <ChevronLeft className="size-4 text-[#0A84FF]" />
              </button>
            )}
            <div className="size-8 rounded-xl bg-gradient-to-tr from-[#0A84FF] to-[#30D158] flex items-center justify-center shadow-md">
              <Building2 className="size-4 text-white" />
            </div>
            <div>
              <div className="text-[12px] font-bold tracking-tight text-white">
                DIGIBANK PLUS
              </div>
              <div className="text-[9px] text-[#8E8E93] font-mono">
                TK: 1903.8829.802
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#30D158]/20 text-[#30D158] font-semibold border border-[#30D158]/30">
            CHÍNH CHỦ
          </span>
        </div>

        {/* Balance Platinum Card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#1A2234] via-[#151D2C] to-[#0E1420] border border-white/15 shadow-xl relative overflow-hidden">
          {/* Card Chip graphic */}
          <div className="absolute top-3 right-3 w-7 h-5 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center opacity-70">
            <div className="w-4 h-3 border border-amber-600/50 rounded-sm" />
          </div>

          <div className="flex items-center justify-between text-[#8E8E93] text-[11px]">
            <span className="flex items-center gap-1.5 font-medium">
              <Wallet className="size-3.5 text-[#0A84FF]" /> Tổng số dư khả dụng
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-[#8E8E93] hover:text-white p-1"
            >
              {showBalance ? (
                <Eye className="size-3.5" />
              ) : (
                <EyeOff className="size-3.5" />
              )}
            </button>
          </div>

          <div className="mt-1 text-[22px] font-extrabold text-white tracking-tight font-mono">
            {showBalance
              ? `${displayBalance.toLocaleString("vi-VN")} đ`
              : "•••••••• đ"}
          </div>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8E8E93]">
            <span>
              Chủ TK: <strong className="text-white">NGUYEN VAN KHANG</strong>
            </span>
            <span className="font-mono">THẺ PLATINUM</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 font-mono text-[10px] border-b border-white/5 bg-[#0D121B]">
        <button
          onClick={() => setFilterType("all")}
          className={cn(
            "px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer",
            filterType === "all"
              ? "bg-[#0A84FF] text-white shadow"
              : "bg-[#161C28] text-[#8E8E93] hover:text-white",
          )}
        >
          Tất cả ({transactions.length})
        </button>
        <button
          onClick={() => setFilterType("in")}
          className={cn(
            "px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer",
            filterType === "in"
              ? "bg-[#30D158] text-black shadow"
              : "bg-[#161C28] text-[#8E8E93] hover:text-white",
          )}
        >
          Tiền vào (+)
        </button>
        <button
          onClick={() => setFilterType("out")}
          className={cn(
            "px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer",
            filterType === "out"
              ? "bg-[#FF453A] text-white shadow"
              : "bg-[#161C28] text-[#8E8E93] hover:text-white",
          )}
        >
          Tiền ra (-)
        </button>
      </div>

      {/* Transaction List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-12 space-y-2">
        {loading && sheetData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8E8E93] space-y-2">
            <Loader2 className="size-5 animate-spin text-[#0A84FF]" />
            <span className="text-[11px] font-mono">
              Đang tải lịch sử giao dịch...
            </span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8E8E93] space-y-2">
            <AlertCircle className="size-6 text-[#8E8E93]/60" />
            <span className="text-[12px] font-sans text-[#8E8E93]">
              Không tìm thấy giao dịch nào
            </span>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.amount > 0;
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={cn(
                  "p-3 rounded-xl bg-[#141A26] border border-white/5 hover:border-white/15 cursor-pointer transition-all active:scale-[0.98]",
                  tx.isEvidence && "border-l-4 border-l-[#0A84FF]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center shrink-0",
                        isIncome
                          ? "bg-[#30D158]/15 text-[#30D158]"
                          : "bg-[#FF453A]/15 text-[#FF453A]",
                      )}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="size-4" />
                      ) : (
                        <ArrowUpRight className="size-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-white truncate max-w-[150px]">
                        {tx.title}
                      </div>
                      <div className="text-[9.5px] text-[#8E8E93] truncate">
                        {tx.receiver}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        "text-[12.5px] font-bold font-mono",
                        isIncome ? "text-[#30D158]" : "text-white",
                      )}
                    >
                      {isIncome ? "+" : ""}
                      {tx.amount.toLocaleString("vi-VN")} đ
                    </div>
                    <div className="text-[9px] text-[#8E8E93] font-mono">
                      {tx.time.split(" ")[0]}
                    </div>
                  </div>
                </div>

                {/* Transaction note tag */}
                <div className="mt-2 text-[10.5px] text-[#A1A1A6] bg-[#0B0E14] px-2 py-1 rounded-md border border-white/5 truncate font-mono flex items-center justify-between">
                  <span>💬 {tx.note}</span>
                  <span className="text-[8.5px] text-[#0A84FF]">
                    Chi tiết →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital Receipt Popup Modal */}
      {selectedTx && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex flex-col justify-center items-center animate-in fade-in-50">
          <div className="w-full max-w-[310px] rounded-2xl bg-[#161B26] border border-[#0A84FF]/40 p-4 shadow-2xl space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-bold text-[#0A84FF] font-mono uppercase tracking-wider flex items-center gap-1">
                <Building2 className="size-3.5" /> Biên Nhận Giao Dịch
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-[#8E8E93] hover:text-white text-xs font-mono"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="text-center py-1 space-y-1">
              <div className="text-[10px] text-[#30D158] font-bold uppercase tracking-widest bg-[#30D158]/15 px-2 py-0.5 rounded-full inline-block border border-[#30D158]/30">
                ✓ THÀNH CÔNG
              </div>
              <div
                className={cn(
                  "text-[20px] font-extrabold font-mono pt-1",
                  selectedTx.amount > 0 ? "text-[#30D158]" : "text-white",
                )}
              >
                {selectedTx.amount > 0 ? "+" : ""}
                {selectedTx.amount.toLocaleString("vi-VN")} đ
              </div>
              <div className="text-[12px] font-bold text-white">
                {selectedTx.title}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0E14] border border-white/5 text-[11px] space-y-2 font-mono text-[#D1D1D6]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Mã giao dịch:</span>
                <span className="text-[#0A84FF] font-semibold">
                  {selectedTx.refId}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Thời gian:</span>
                <span>{selectedTx.time}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Đối tác:</span>
                <span className="text-white font-semibold truncate max-w-[140px]">
                  {selectedTx.receiver}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Số TK đối tác:</span>
                <span className="text-right text-[10px]">
                  {selectedTx.accountNo}
                </span>
              </div>
              <div>
                <span className="text-[#8E8E93] block mb-0.5">
                  Nội dung chuyển khoản:
                </span>
                <p className="text-white italic leading-relaxed bg-[#141A26] p-1.5 rounded border border-white/5">
                  "{selectedTx.note}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
