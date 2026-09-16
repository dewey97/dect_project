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
  Wallet,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BankingAppProps {
  onBackToHome?: () => void
}

export function BankingApp({ onBackToHome }: BankingAppProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [selectedTx, setSelectedTx] = useState<any | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all')

  const transactions = [
    {
      id: 'tx-01',
      refId: 'FT1620498102948',
      title: 'Chuyển tiền cọc Tour Đà Lạt (2 người)',
      receiver: 'CÔNG TY CP DU LỊCH VIỆT',
      accountNo: '0181.000.492.812 (Vietcombank)',
      amount: -12000000,
      time: '15:30 (22/07/2016)',
      category: 'Du lịch & Giải trí',
      note: 'Khang CK coc tour Da Lat 25/7 - Yen Nhi',
      isEvidence: true
    },
    {
      id: 'tx-02',
      refId: 'FT1620119284019',
      title: 'Nhận tiền trả nợ lãi tháng 7',
      receiver: 'LE QUANG VU',
      accountNo: '1902.948.102.391 (Techcombank)',
      amount: 10500000,
      time: '11:20 (19/07/2016)',
      category: 'Thu hồi nợ',
      note: 'Vu tra lai thang 7 khoan 350tr',
      isEvidence: true
    },
    {
      id: 'tx-03',
      refId: 'FT1619602910481',
      title: 'Nhận tiền cọc mua đất Bờ Sông đợt 1',
      receiver: 'NGUYEN HOANG HAI',
      accountNo: '0071.000.918.231 (Vietcombank)',
      amount: 200000000,
      time: '09:15 (15/07/2016)',
      category: 'Bất động sản',
      note: 'Tien coc giay tay thua dat 14 bo song',
      isEvidence: true
    },
    {
      id: 'tx-04',
      refId: 'FT1619182391024',
      title: 'Thanh toán hóa đơn Tiệm vàng Kim Thành',
      receiver: 'TIEM VANG KIM THANH',
      accountNo: '1020.192.839.102 (BIDV)',
      amount: -18500000,
      time: '16:45 (10/07/2016)',
      category: 'Mua sắm trang sức',
      note: 'Mua day chuyen vang trang tang Nhi',
      isEvidence: false
    },
    {
      id: 'tx-05',
      refId: 'FT1618691029481',
      title: 'Nhận tiền đền bù GPMB đợt 1 Ban QLDA Bờ Sông',
      receiver: 'KHO BAC NHA NUOC DONG DA',
      accountNo: '0141.000.119.201 (Agribank)',
      amount: 2100000000,
      time: '14:00 (05/07/2016)',
      category: 'Đền bù nhà đất',
      note: 'Tien den bu dot 1 thua dat 14 bo song - Nguyen Van Khang',
      isEvidence: true
    },
    {
      id: 'tx-06',
      refId: 'FT1618301928410',
      title: 'Chuyển phí dịch vụ pháp lý thừa kế di chúc',
      receiver: 'VP LUAT SU NAM VAP CONG SU',
      accountNo: '1903.291.049.102 (Techcombank)',
      amount: -50000000,
      time: '10:30 (02/07/2016)',
      category: 'Pháp lý',
      note: 'Thanh toan phi dich vu ho so thua ke & hop dong di chúc',
      isEvidence: true
    }
  ]

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'in') return tx.amount > 0
    if (filterType === 'out') return tx.amount < 0
    return true
  })

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
              <div className="text-[12px] font-bold tracking-tight text-white">DIGIBANK PLUS</div>
              <div className="text-[9px] text-[#8E8E93] font-mono">TK: 1903.8829.802</div>
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
              {showBalance ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            </button>
          </div>

          <div className="mt-1 text-[22px] font-extrabold text-white tracking-tight font-mono">
            {showBalance ? '540.250.000 đ' : '•••••••• đ'}
          </div>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8E8E93]">
            <span>Chủ TK: <strong className="text-white">NGUYEN VAN KHANG</strong></span>
            <span className="font-mono">THẺ PLATINUM</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 font-mono text-[10px] border-b border-white/5 bg-[#0D121B]">
        <button
          onClick={() => setFilterType('all')}
          className={cn(
            'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
            filterType === 'all'
              ? 'bg-[#0A84FF] text-white shadow'
              : 'bg-[#161C28] text-[#8E8E93] hover:text-white'
          )}
        >
          Tất cả ({transactions.length})
        </button>
        <button
          onClick={() => setFilterType('in')}
          className={cn(
            'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
            filterType === 'in'
              ? 'bg-[#30D158] text-black shadow'
              : 'bg-[#161C28] text-[#8E8E93] hover:text-white'
          )}
        >
          Tiền vào (+)
        </button>
        <button
          onClick={() => setFilterType('out')}
          className={cn(
            'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
            filterType === 'out'
              ? 'bg-[#FF453A] text-white shadow'
              : 'bg-[#161C28] text-[#8E8E93] hover:text-white'
          )}
        >
          Tiền ra (-)
        </button>
      </div>

      {/* Transaction List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-12 space-y-2">
        {filteredTransactions.map((tx) => {
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
                    <div className="text-[9.5px] text-[#8E8E93] truncate">{tx.receiver}</div>
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
              <div className="mt-2 text-[10.5px] text-[#A1A1A6] bg-[#0B0E14] px-2 py-1 rounded-md border border-white/5 truncate font-mono flex items-center justify-between">
                <span>💬 {tx.note}</span>
                <span className="text-[8.5px] text-[#0A84FF]">Chi tiết →</span>
              </div>
            </div>
          )
        })}
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
                  'text-[20px] font-extrabold font-mono pt-1',
                  selectedTx.amount > 0 ? 'text-[#30D158]' : 'text-white'
                )}
              >
                {selectedTx.amount > 0 ? '+' : ''}
                {selectedTx.amount.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[12px] font-bold text-white">{selectedTx.title}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0E14] border border-white/5 text-[11px] space-y-2 font-mono text-[#D1D1D6]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Mã giao dịch:</span>
                <span className="text-[#0A84FF] font-semibold">{selectedTx.refId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Thời gian:</span>
                <span>{selectedTx.time}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Đối tác:</span>
                <span className="text-white font-semibold truncate max-w-[140px]">{selectedTx.receiver}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[#8E8E93]">Số TK đối tác:</span>
                <span className="text-right text-[10px]">{selectedTx.accountNo}</span>
              </div>
              <div>
                <span className="text-[#8E8E93] block mb-0.5">Nội dung chuyển khoản:</span>
                <p className="text-white italic leading-relaxed bg-[#141A26] p-1.5 rounded border border-white/5">
                  "{selectedTx.note}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
