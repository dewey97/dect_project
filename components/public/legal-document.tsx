import type { ReactNode } from "react";
import { LandingNavbar } from "@/components/public/landing-navbar";
import { LandingFooter } from "@/components/public/landing-footer";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/**
 * Thông tin pháp lý của đơn vị vận hành. Điền đầy đủ trước khi công bố chính thức:
 * pháp luật về thương mại điện tử và bảo vệ dữ liệu cá nhân yêu cầu nêu rõ bên thu thập/kiểm soát dữ liệu.
 */
export const LEGAL_ENTITY = {
  name: "[Tên đơn vị vận hành]",
  taxCode: "[Mã số thuế]",
  address: "[Địa chỉ trụ sở]",
  supportEmail: "support@xplore.vn",
  privacyEmail: "privacy@xplore.vn",
  /** Bật true khi đã điền tên đơn vị, MST, địa chỉ thật. false: ẩn các dòng thông tin đơn vị trên trang pháp lý. */
  published: false,
};

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
];

export function LegalDocument({
  title,
  effective,
  updated,
  sections,
}: {
  title: string;
  effective: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative flex flex-col justify-between selection:bg-amber-500 selection:text-zinc-950">
      <LandingNavbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <header className="space-y-2 pb-8 mb-8 border-b border-zinc-800/80">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-100">
            {title}
          </h1>
          <p className="text-sm text-zinc-500">
            Áp dụng từ: {effective} • Cập nhật lần cuối: {updated}
          </p>
        </header>

        {/* Mục lục */}
        <nav
          aria-label="Mục lục"
          className="mb-12 border-l-2 border-amber-500 bg-[oklch(0.21_0.009_265)] px-5 py-4"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-100">
            Nội dung
          </p>
          <ol className="space-y-1.5 text-[15px]">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex gap-2 text-zinc-300 hover:text-amber-400 hover:underline underline-offset-4 transition-colors"
                >
                  <span className="w-14 shrink-0 font-mono text-amber-500/80">
                    {ROMAN[i]}.
                  </span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 text-[15px] text-zinc-300 leading-relaxed">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="space-y-3 scroll-mt-24">
              <h2 className="text-lg font-bold text-zinc-100">
                <span className="mr-2 font-mono text-amber-500/80">
                  {ROMAN[i]}.
                </span>
                {s.title}
              </h2>
              <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-zinc-100">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
