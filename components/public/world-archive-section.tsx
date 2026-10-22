"use client";

import { CASE_FOLDERS } from "@/lib/data/landing-data";

export function WorldArchiveSection() {
  return (
    <section
      id="bocanh"
      className="w-full max-w-6xl px-6 py-8 sm:py-10 lg:py-16 z-10 bg-card/5 relative min-h-0 lg:min-h-[560px] flex items-center justify-center"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[140px] pointer-events-none" />

      {/* SCATTERED PHOTOS (OVERLAPPING) — left side (2 photos for desktop) */}
      <div className="hidden lg:block absolute top-[22%] left-2 w-48 shadow-2xl rotate-[-7deg] hover:rotate-[-3deg] hover:scale-105 hover:z-30 transition-all duration-300 select-none cursor-pointer overflow-hidden z-10 border border-white/20 rounded-xs">
        <img
          src="/images/landing/chalk_outline.png"
          alt="Hiện trường chalk outline"
          className="w-full h-full object-cover filter contrast-105"
        />
      </div>

      <div className="hidden lg:block absolute top-[44%] left-12 w-44 shadow-xl rotate-[7deg] hover:rotate-[3deg] hover:scale-105 hover:z-30 transition-all duration-300 select-none cursor-pointer overflow-hidden z-20 border border-white/10 rounded-xs">
        <img
          src="/images/landing/newspaper_clipping.webp"
          alt="Mẩu báo điều tra"
          className="w-full h-full object-cover filter sepia-[0.2] brightness-90"
        />
      </div>

      {/* MANILA FOLDER STACK — right side */}
      <div className="hidden lg:block absolute bottom-28 right-[-20px] w-[290px] h-[400px]">
        {CASE_FOLDERS.map((f) => (
          <button
            key={f.idx}
            style={{
              position: "absolute",
              bottom: 0,
              right: f.right,
              rotate: f.defaultR,
              zIndex: (f.idx + 1) * 10,
              transition: "all 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
              transformOrigin: "bottom center",
              outline: "none",
            }}
            className="w-[190px] h-[265px] flex flex-col select-none cursor-pointer hover:-translate-y-5 hover:scale-[1.04] hover:z-50"
          >
            {/* Tab */}
            <div
              style={{
                alignSelf: "flex-start",
                marginLeft: "18px",
                width: "80px",
                height: "18px",
                borderRadius: "4px 4px 0 0",
                background: "linear-gradient(to bottom,#c8a96e,#b8935a)",
                border: "1px solid #a07840",
                borderBottom: "none",
                boxShadow: "inset 0 1px 0 rgba(255,240,200,0.25)",
              }}
            />
            {/* Body */}
            <div
              style={{
                flex: 1,
                borderRadius: "0 4px 3px 3px",
                border: "1px solid #9a7040",
                background:
                  "linear-gradient(155deg,#c9a460,#bb9448 45%,#ad8030)",
                boxShadow:
                  "0 6px 18px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,240,180,0.18)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "16px 14px 14px",
                transition: "background .5s,box-shadow .5s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  opacity: 0.16,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "160px 160px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "36px",
                  background:
                    "linear-gradient(to top,rgba(80,45,0,0.22),transparent)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 10,
                  border: "1.5px solid rgba(180,30,30,0.6)",
                  color: "rgba(175,28,28,0.68)",
                  fontFamily: "monospace",
                  fontSize: "0.38rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.17em",
                  padding: "2px 5px",
                  transform: "rotate(10deg)",
                  fontWeight: 900,
                  borderRadius: "2px",
                }}
              >
                {f.status}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.45rem",
                    color: "rgba(60,35,5,0.6)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  {f.label}
                </span>
                <h3
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    color: "rgba(25,12,0,0.86)",
                    lineHeight: 1.35,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {f.title}
                </h3>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "1px",
                  background: "rgba(80,45,0,0.15)",
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Centered Text Container */}
      <div className="max-w-xl mx-auto text-center flex flex-col gap-5 items-center z-10 relative">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-foreground tracking-tight leading-tight text-center font-sans">
          Chào mừng các bạn đến với{" "}
          <span className="text-primary font-bold">Tổ Điều Tra Đặc Biệt</span>
        </h2>

        <div className="py-2 px-4 sm:px-8 flex flex-col gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans text-center">
          <p>
            Khi cảnh sát địa phương hoàn toàn bế tắc trước những kỳ án chấn
            động, tập hồ sơ niêm phong sẽ được chuyển giao thẳng cho nhóm thám
            tử tập sự của bạn. Hãy cùng các cộng sự mở hộp tang vật, phân chia
            nhiệm vụ và đối chiếu từng manh mối nhỏ nhất.
          </p>
        </div>
      </div>
    </section>
  );
}
