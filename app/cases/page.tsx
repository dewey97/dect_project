import { BrandMark } from '@/components/investigation/brand-mark'

export default function CasesPage() {
  return (
    <main className="flex flex-col items-center min-h-dvh bg-background text-foreground px-6 py-12">
      <BrandMark className="mb-10" />

      <h1 className="font-mono text-[0.65rem] text-primary uppercase tracking-[0.25em] font-bold mb-3">
        DANH MỤC VỤ ÁN // CASE DOSSIER
      </h1>
      <h2 className="text-2xl lg:text-3xl font-black uppercase text-center mb-12">
        Khám Phá Các Vụ Án
      </h2>

      <div className="w-full max-w-3xl flex flex-col gap-4">
        {/* Case 1 */}
        <a
          href="/"
          className="group flex flex-col sm:flex-row gap-4 p-5 border border-border/60 bg-card/20 rounded-lg hover:border-primary/50 hover:bg-card/40 transition-all duration-300"
        >
          <div className="w-full sm:w-28 h-36 sm:h-auto rounded overflow-hidden shrink-0 border border-border/30">
            <img
              src="/nocturne_case_9.png"
              alt="Bóng Ma Cầu Cảng Số 9"
              className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.5rem] text-destructive font-bold uppercase tracking-widest px-1.5 py-0.5 border border-destructive/30 rounded">
                ĐANG MỞ
              </span>
              <span className="font-mono text-[0.45rem] text-muted-foreground uppercase tracking-wider">
                NX-4471
              </span>
            </div>
            <h3 className="font-typewriter text-base font-bold uppercase text-foreground">
              Bóng Ma Cầu Cảng Số 9
            </h3>
            <p className="font-sans text-xs text-muted-foreground leading-relaxed">
              Vụ mất tích bí ẩn tại Cầu cảng số 9 — Camera mất tín hiệu 15 phút, vận đơn bất thường, tang vật mã hóa AES-256.
            </p>
            <span className="font-mono text-[0.5rem] text-primary/70 uppercase tracking-wider mt-auto">
              Ước tính: 60–90 phút phá án →
            </span>
          </div>
        </a>

        {/* Case 2 */}
        <a
          href="/"
          className="group flex flex-col sm:flex-row gap-4 p-5 border border-border/60 bg-card/20 rounded-lg hover:border-primary/50 hover:bg-card/40 transition-all duration-300"
        >
          <div className="w-full sm:w-28 h-36 sm:h-auto rounded overflow-hidden shrink-0 border border-border/30">
            <img
              src="/nocturne_case_north.png"
              alt="Mật Mã Cảng Bắc"
              className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.5rem] text-amber-500 font-bold uppercase tracking-widest px-1.5 py-0.5 border border-amber-500/30 rounded">
                SẮP RA MẮT
              </span>
              <span className="font-mono text-[0.45rem] text-muted-foreground uppercase tracking-wider">
                NX-4472
              </span>
            </div>
            <h3 className="font-typewriter text-base font-bold uppercase text-foreground">
              Mật Mã Cảng Bắc
            </h3>
            <p className="font-sans text-xs text-muted-foreground leading-relaxed">
              Hồ sơ điều tra tại phân khu cảng — Biên bản pháp y, sơ đồ hiện trường, nhật ký ca trực bị tẩy xóa.
            </p>
            <span className="font-mono text-[0.5rem] text-primary/70 uppercase tracking-wider mt-auto">
              Coming soon →
            </span>
          </div>
        </a>

        {/* Case 3 */}
        <a
          href="/"
          className="group flex flex-col sm:flex-row gap-4 p-5 border border-border/60 bg-card/20 rounded-lg hover:border-primary/50 hover:bg-card/40 transition-all duration-300"
        >
          <div className="w-full sm:w-28 h-36 sm:h-auto rounded overflow-hidden shrink-0 border border-border/30">
            <img
              src="/suspect_marsh.png"
              alt="Bí Mật Xí Nghiệp Đường Sắt"
              className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.5rem] text-amber-500 font-bold uppercase tracking-widest px-1.5 py-0.5 border border-amber-500/30 rounded">
                SẮP RA MẮT
              </span>
              <span className="font-mono text-[0.45rem] text-muted-foreground uppercase tracking-wider">
                NX-4473
              </span>
            </div>
            <h3 className="font-typewriter text-base font-bold uppercase text-foreground">
              Bí Mật Xí Nghiệp Đường Sắt
            </h3>
            <p className="font-sans text-xs text-muted-foreground leading-relaxed">
              Vụ tấn công ransomware mã hóa dữ liệu tài chính — Mã độc WannaDie, ví điện tử nhận tiền chuộc.
            </p>
            <span className="font-mono text-[0.5rem] text-primary/70 uppercase tracking-wider mt-auto">
              Coming soon →
            </span>
          </div>
        </a>
      </div>
    </main>
  )
}
