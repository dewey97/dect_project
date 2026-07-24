'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScanLine, ArrowRight, ShieldQuestion, FolderOpen, FileText, Terminal, RefreshCw, Cpu, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/investigation/brand-mark'
import { cn } from '@/lib/utils'

export function CaseActivation() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isBooted, setIsBooted] = useState(false)
  
  // Simulated Diagnostic Boot Sequence States
  const [bootLogs, setBootLogs] = useState<string[]>([])
  const [bootStep, setBootStep] = useState(0)

  const LOG_SEQUENCE = [
    'SYS // INITIATING NOCTURNE COGNITIVE OS',
    'SYS // ĐIỂM TRUY CẬP: VĂN PHÒNG_NIGHTJAR',
    'LINK // BẢO MẬT ĐƯỜNG TRUYỀN COM_CHANNEL... OK',
    'MODULE // TẢI MÔ-ĐUN GIẢI MÃ v4.81... OK',
    'MODULE // TẢI BỘ XEM DỮ LIỆU EXTRACTION CHIP-OFF... OK',
    'DATA // PHÂN TÍCH CHỈ MỤC THIẾT BỊ THU GIỮ... OK',
    'SECURITY // THIẾT LẬP PHONG BÌ NIÊM PHONG PHÁP Y... OK',
    'SYS // MÁY TRẠM NOCTURNE ĐÃ SẴN SÀNG HOẠT ĐỘNG'
  ]

  useEffect(() => {
    if (!isBooted && bootStep < LOG_SEQUENCE.length) {
      const timer = setTimeout(() => {
        setBootLogs((prev) => [...prev, LOG_SEQUENCE[bootStep]])
        setBootStep((prev) => prev + 1)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [bootStep, isBooted])

  const canSubmit = code.trim().length >= 4

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    router.push('/dashboard')
  }

  return (
    <main className="noir-spotlight relative flex min-h-dvh w-full justify-center items-center overflow-x-hidden">
      {/* CRT scanlines overlay */}
      <div
        aria-hidden="true"
        className="noir-scanlines pointer-events-none absolute inset-0 opacity-35"
      />

      <div className={cn(
        "relative w-full px-6 py-10 transition-all duration-300",
        "flex flex-col justify-between min-h-dvh max-w-[30rem]", // Mobile default
        "lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:max-w-6xl lg:min-h-0 lg:h-fit lg:py-16 lg:items-center" // Desktop adaptations
      )}>

        {/* LEFT COLUMN: Visual graphic panel (Classified Dossier, hidden on mobile) */}
        <div className="hidden lg:flex flex-col gap-6 border border-border bg-card/20 rounded-xl p-8 relative overflow-hidden h-[500px] justify-between shadow-[0_0_50px_rgba(199,145,55,0.03)] animate-fade-in">
          <div aria-hidden="true" className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="flex items-center justify-between border-b border-border/40 pb-3 z-10">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
              <FolderOpen className="size-4" /> KHO LƯU TRỮ VẬT CHỨNG
            </span>
            <span className="font-mono text-[0.6rem] text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded uppercase">
              TRẠNG THÁI: ĐÃ LƯU KHO
            </span>
          </div>

          {/* Dossier Mockup Visual */}
          <div className="flex-1 flex items-center justify-center relative my-4 z-10">
            <div className="relative w-64 h-48 bg-amber-950/15 border-2 border-primary/45 rounded-lg rounded-tl-none shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between p-4 transform hover:scale-102 transition-transform duration-200">
              
              <div className="absolute -top-6 left-0 h-6 w-24 bg-background border-t-2 border-x-2 border-primary/45 rounded-t-md flex items-center justify-center font-mono text-[0.55rem] text-primary font-bold">
                NX-4471 // ACTV
              </div>

              <div className="flex justify-between items-start pt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[0.55rem] text-muted-foreground uppercase">TÀI SẢN CỦA:</span>
                  <span className="font-sans text-[0.65rem] font-bold text-foreground uppercase">CỤC CẢNH SÁT</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="h-6 w-16 bg-foreground opacity-60 flex gap-0.5 p-0.5">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className={cn("h-full bg-background", idx % 3 === 0 ? "w-1" : "w-[0.5px]")} />
                    ))}
                  </div>
                  <span className="font-mono text-[0.45rem] text-muted-foreground mt-0.5">EVID-902-12</span>
                </div>
              </div>

              <div className="my-auto self-center transform -rotate-12 border-2 border-dashed border-destructive/60 px-4 py-1 text-destructive/60 font-mono font-black text-xs uppercase tracking-widest rounded select-none">
                HỒ SƠ BẢO MẬT
              </div>

              <div className="border-t border-primary/20 pt-2 flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground">
                <FileText className="size-3 text-primary" />
                <span>KỆ LƯU TRỮ AN TOÀN // PHÂN KHU 12</span>
              </div>
            </div>
          </div>

          <div className="font-mono text-[0.55rem] text-muted-foreground/80 leading-relaxed border-t border-border/40 pt-4 z-10">
            CẢNH BÁO: Mọi nỗ lực xâm nhập xác thực trái phép sẽ bị ghi nhận địa chỉ IP máy trạm điều hành gửi về tổng cục.
          </div>
        </div>

        {/* RIGHT COLUMN: Boot simulation first, then code activation entry form */}
        <div className="flex flex-col justify-between flex-1 h-full lg:min-h-[500px]">
          
          <BrandMark className="pt-[env(safe-area-inset-top)] lg:pt-0" />

          {/* STEP A: Simulated Boot Diagnostics Screen */}
          {!isBooted && (
            <div className="flex-1 flex flex-col justify-between my-6">
              <div className="flex flex-col items-start gap-3 mt-4">
                <div className="flex size-12 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 animate-pulse">
                  <Cpu className="size-6" />
                </div>
                <span className="label-system text-primary mt-2">CỔNG BẢO MẬT</span>
                <h2 className="text-xl font-bold uppercase tracking-wide">Kết nối máy trạm</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Thiết lập kênh truyền mã hóa và tải phân vùng phục hồi phân tích vật chứng kỹ thuật số.
                </p>
              </div>

              {/* Terminal Logs Panel */}
              <div className="w-full rounded-lg border border-border/80 bg-card/45 p-4 my-6 font-mono text-[0.625rem] text-muted-foreground flex flex-col gap-1.5 min-h-[180px] justify-end shadow-inner">
                <div className="flex items-center gap-1 text-[0.55rem] font-bold text-primary border-b border-border/20 pb-1.5 mb-1 tracking-widest uppercase">
                  <Terminal className="size-3 shrink-0" />
                  <span>TRÌNH TỰ KHỞI ĐỘNG HỆ THỐNG</span>
                </div>
                <div className="flex flex-col gap-1 flex-1 justify-end">
                  {bootLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-primary shrink-0">&gt;</span>
                      <span className={idx === LOG_SEQUENCE.length - 1 ? 'text-emerald-500 font-bold' : ''}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {bootStep < LOG_SEQUENCE.length && (
                    <div className="flex items-center gap-1 text-primary animate-pulse">
                      <span className="shrink-0">&gt;</span>
                      <RefreshCw className="size-3 animate-spin" />
                      <span>ĐANG_TẢI_PHÂN_VÙNG...</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setIsBooted(true)}
                disabled={bootStep < LOG_SEQUENCE.length}
                size="lg"
                className="h-14 w-full gap-2 text-sm font-bold uppercase tracking-widest transition-transform active:scale-[0.98]"
              >
                <Key className="size-4" />
                Khởi chạy Máy trạm
              </Button>
            </div>
          )}

          {/* STEP B: Actual Pin Input entry Form (Revealed after boot complete) */}
          {isBooted && (
            <div className="flex-1 flex flex-col justify-between my-6 animate-fade-in">
              <div className="flex flex-col items-start mt-4">
                <span className="flex size-14 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                  <ScanLine className="size-7" aria-hidden="true" />
                </span>
                <p className="label-system mt-6 text-primary">Xác thực Truy cập</p>
                <h1 className="mt-2 text-balance text-4xl font-semibold leading-[1.05] tracking-tight">
                  Kích hoạt hồ sơ vụ án
                </h1>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground font-sans">
                  Nhập mã kích hoạt in bên trong hộp trò chơi để mở khóa các thiết bị tang vật bị niêm phong và bắt đầu điều tra.
                </p>
              </div>

              {/* Code entry */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-6">
                <div>
                  <label htmlFor="case-code" className="label-system mb-2 block">
                    Mã số Vụ án (Case Code)
                  </label>
                  <input
                    id="case-code"
                    name="case-code"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="NX-0000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="h-16 w-full rounded-lg border border-input bg-card px-4 text-center font-mono text-2xl tracking-[0.4em] text-foreground caret-primary outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-1 focus:ring-ring"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={!canSubmit}
                  className="h-14 w-full gap-2 text-base font-semibold transition-transform active:scale-[0.98] uppercase tracking-wider"
                >
                  Truy cập Hệ thống
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
              </form>

              {/* Footer Info */}
              <button
                type="button"
                onClick={() => alert('Mã kích hoạt vụ án dạng NX-4471 được in ở bìa trong của hồ sơ tài liệu vật lý đi kèm hộp game.')}
                className="mx-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors active:text-foreground hover:text-primary pt-2 font-sans"
              >
                <ShieldQuestion className="size-4" aria-hidden="true" />
                Tôi có thể tìm mã kích hoạt ở đâu?
              </button>
            </div>
          )}

        </div>

      </div>
    </main>
  )
}
