'use client'

import { useState } from 'react'
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
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function BankingApp() {
  const [showBalance, setShowBalance] = useState(true)
  const [selectedTx, setSelectedTx] = useState<any | null>(null)

  const transactions = [
    {
      id: 'tx-01',
      title: 'Chuyển tiền cọc Tour Đà Lạt (2 người)',
      receiver: 'CÔNG TY CP DU LỊCH VIỆT',
      amount: -12000000,
      time: '15:30 (22/07/2026)',
      category: 'Du lịch & Giải trí',
      note: 'Khang CK coc tour Da Lat 25/7 - Yen Nhi',
      isEvidence: true
    },
    {
      id: 'tx-02',
      title: 'Nhận tiền trả nợ lãi tháng 7',
      receiver: 'LE QUANG VU',
      amount: 10500000,
      time: '11:20 (19/07/2026)',
      category: 'Thu hồi nợ',
      note: 'Vu tra lai thang 7 khoan 350tr',
      isEvidence: true
    },
    {
      id: 'tx-03',
      title: 'Nhận tiền cọc mua đất Bờ Sông đợt 1',
      receiver: 'NGUYEN HOANG HAI',
      amount: 200000000,
      time: '09:15 (15/07/2026)',
      category: 'Bất động sản',
      note: 'Tien coc giay tay thua dat 14 bo song',
      isEvidence: true
    },
    {
      id: 'tx-04',
      title: 'Thanh toán hóa đơn Tiệm vàng Kim Thành',
      receiver: 'TIEM VANG KIM THANH',
      amount: -18500000,
      time: '16:45 (10/07/2026)',
      category: 'Mua sắm trang sức',
      note: 'Mua day chuyen vang trang tang Nhi',
      isEvidence: false
    }
  ]

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-white select-none overflow-hidden font-sans">
      {/* Top Bank Header */}
      <div className="px-4 pt-3 pb-3 bg-gradient-to-b from-[#161B26] to-[#0B0E14] border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-tr from-[#0A84FF] to-[#30D158] flex items-center justify-center shadow-md">
              <Building2 className="size-4 text-white" />
            </div>
            <div>
              <div className="text-[12px] font-bold tracking-tight text-white">DIGIBANK PLUS</div>
              <div className="text-[9px] text-[#8E8E93] font-mono">TK: 1903.8829.xxx</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#30D158]/20 text-[#30D158] font-semibold border border-[#30D158]/30">
            CHÍNH CHỦ
          </span>
        </div>

        {/* Balance Card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#1A2234] to-[#121824] border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8E8E93] text-[11px]">
            <span className="flex items-center gap-1.5 font-medium">
              <Wallet className="size-3.5 text-[#0A84FF]" /> Tổng số dư khả dụng
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-[#8E8E93] hover:text-white"
            >
              {showBalance ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            </button>
          </div>

          <div className="mt-1 text-[22px] font-extrabold text-white tracking-tight font-mono">
            {showBalance ? '540.250.000 đ' : '•••••••• đ'}
          </div>

          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8E8E93]">
            <span>Chủ TK: <strong>NGUYEN VAN KHANG</strong></span>
            <span>Hạn mức: 2 tỷ/ngày</span>
          </div>
        </div>
      </div>

      {/* Transaction List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-12 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-bold text-white tracking-tight">
            Lịch sử giao dịch gần đây
          </span>
          <span className="text-[10px] text-[#8E8E93] font-mono">Tháng 7/2026</span>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => {
            const isIncome = tx.amount > 0
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={cn(
                  'p-3 rounded-xl bg-[#141A26] border border-white/5 hover:border-white/15 cursor-pointer transition-all active:scale-[0.98]',
                  tx.isEvidence && 'border-l-4 border-l-[#0A84FF]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'size-8 rounded-full flex items-center justify-center shrink-0',
                        isIncome
                          ? 'bg-[#30D158]/15 text-[#30D158]'
                          : 'bg-[#FF453A]/15 text-[#FF453A]'
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
                      <div className="text-[9.5px] text-[#8E8E93]">{tx.receiver}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        'text-[12.5px] font-bold font-mono',
                        isIncome ? 'text-[#30D158]' : 'text-white'
                      )}
                    >
                      {isIncome ? '+' : ''}
                      {tx.amount.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="text-[9px] text-[#8E8E93] font-mono">{tx.time.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Transaction note tag */}
                <div className="mt-2 text-[10.5px] text-[#A1A1A6] bg-[#0B0E14] px-2 py-1 rounded-md border border-white/5 truncate font-mono">
                  💬 {tx.note}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected TX Modal / Detail */}
        {selectedTx && (
          <div className="p-3.5 rounded-2xl bg-[#161B26] border border-[#0A84FF]/40 space-y-2 mt-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#0A84FF]">
              <span>CHI TIẾT CHUYỂN TIỀN</span>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-white hover:text-[#0A84FF] text-xs font-mono"
              >
                ✕ Đóng
              </button>
            </div>
            <div className="text-[13px] font-bold text-white">{selectedTx.title}</div>
            <div className="text-[11px] text-[#D1D1D6] space-y-1 font-mono">
              <div>Thời gian: {selectedTx.time}</div>
              <div>Người nhận: {selectedTx.receiver}</div>
              <div>Nội dung: {selectedTx.note}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
