"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CASE_FOLDERS } from "@/lib/data/landing-data";

export function WorldArchiveSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Mapped 1:1 trực tiếp theo hành trình cuộn: từ lúc section chạm 90% màn hình đến khi vào tâm màn hình (50%)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 90%", "center 50%"],
  });

  // =========================================================================
  // BÊN TRÁI: TÀI LIỆU VĂNG TỪ NGOÀI CÙNG MÉP MÀN HÌNH BÊN TRÁI VÀO (KHÔNG SCALE)
  // =========================================================================
  const xLeftNote = useTransform(scrollYProgress, [0, 1], [-1150, 0]);
  const rotLeftNote = useTransform(scrollYProgress, [0, 1], [-45, -14]);
  const opLeftNote = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.6, 0.85]);

  const xLeft0 = useTransform(scrollYProgress, [0, 0.88], [-1250, 0]);
  const rotLeft0 = useTransform(scrollYProgress, [0, 0.88], [-55, -12]);
  const opLeft0 = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.7, 1]);

  const xLeft1 = useTransform(scrollYProgress, [0.06, 0.94], [-1350, 0]);
  const rotLeft1 = useTransform(scrollYProgress, [0.06, 0.94], [-40, -4]);
  const opLeft1 = useTransform(scrollYProgress, [0.06, 0.45, 1], [0, 0.7, 1]);

  const xLeft2 = useTransform(scrollYProgress, [0.12, 1], [-1450, 0]);
  const rotLeft2 = useTransform(scrollYProgress, [0.12, 1], [-30, 6]);
  const opLeft2 = useTransform(scrollYProgress, [0.12, 0.5, 1], [0, 0.7, 1]);

  // =========================================================================
  // BÊN PHẢI: ẢNH HIỆN TRƯỜNG VĂNG TỪ NGOÀI CÙNG MÉP MÀN HÌNH BÊN PHẢI VÀO (KHÔNG SCALE)
  // =========================================================================
  const xRight0 = useTransform(scrollYProgress, [0, 0.88], [1250, 0]);
  const rotRight0 = useTransform(scrollYProgress, [0, 0.88], [45, 8]);
  const opRight0 = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.7, 1]);

  const xRight1 = useTransform(scrollYProgress, [0.06, 0.94], [1350, 0]);
  const rotRight1 = useTransform(scrollYProgress, [0.06, 0.94], [-35, -6]);
  const opRight1 = useTransform(scrollYProgress, [0.06, 0.45, 1], [0, 0.7, 1]);

  const xRight2 = useTransform(scrollYProgress, [0.12, 1], [1450, 0]);
  const rotRight2 = useTransform(scrollYProgress, [0.12, 1], [30, 12]);
  const opRight2 = useTransform(scrollYProgress, [0.12, 0.5, 1], [0, 0.7, 0.9]);

  // KHỐI TEXT TRUNG TÂM
  const opText = useTransform(scrollYProgress, [0.15, 0.8], [0.3, 1]);
  const yText = useTransform(scrollYProgress, [0.15, 0.8], [25, 0]);

  const folderTransforms = [
    { x: xLeft0, rotate: rotLeft0, opacity: opLeft0 },
    { x: xLeft1, rotate: rotLeft1, opacity: opLeft1 },
    { x: xLeft2, rotate: rotLeft2, opacity: opLeft2 },
  ];

  return (
    <section
      ref={sectionRef}
      id="bocanh"
      className="w-full overflow-x-clip z-10 bg-card/5 relative min-h-0 lg:min-h-[560px] flex items-center justify-center select-none py-12 sm:py-16 lg:py-24"
    >
      <div className="w-full max-w-6xl px-6 relative flex items-center justify-center min-h-0 lg:min-h-[560px]">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[140px] pointer-events-none" />

        {/* ========================================================================= */}
        {/* TÀI LIỆU & HỒ SƠ VỤ ÁN — CUỘN THÌ BAY TỪ NGOÀI CÙNG MÉP TRÁI VÀO           */}
        {/* ========================================================================= */}
        <div className="block absolute bottom-6 lg:bottom-12 -left-6 sm:left-[-10px] lg:left-0 xl:left-4 w-[210px] sm:w-[240px] lg:w-[280px] h-[320px] lg:h-[380px] pointer-events-none opacity-60 sm:opacity-85 lg:opacity-100 z-10">
          {/* Mẩu ghi chú hiện trường lót dưới tập hồ sơ */}
          <motion.div
            style={{ x: xLeftNote, rotate: rotLeftNote, opacity: opLeftNote }}
            className="absolute -top-10 left-4 sm:left-6 w-28 sm:w-36 shadow-xl border border-white/10 rounded-xs overflow-hidden pointer-events-auto"
          >
            <img
              src="/images/landing/newspaper_clipping.webp"
              alt="Mẩu báo điều tra bên lề"
              className="w-full h-auto object-cover filter sepia-[0.3] brightness-90 contrast-105"
            />
          </motion.div>

          {/* Chồng 3 tập hồ sơ vụ án (Manila Folders) văng vào từ bên trái */}
          {CASE_FOLDERS.map((f, i) => {
            const t = folderTransforms[i] || folderTransforms[0];
            return (
              <motion.button
                key={f.idx}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: f.left,
                  x: t.x,
                  rotate: t.rotate,
                  opacity: t.opacity,
                  zIndex: (f.idx + 1) * 10,
                  transformOrigin: "bottom left",
                  outline: "none",
                }}
                className="w-[145px] sm:w-[165px] lg:w-[185px] h-[210px] sm:h-[235px] lg:h-[255px] flex flex-col select-none cursor-pointer hover:-translate-y-4 hover:z-50 transition-transform duration-300 pointer-events-auto"
              >
              {/* Tab Folder */}
              <div
                style={{
                  alignSelf: "flex-start",
                  marginLeft: "16px",
                  width: "70px",
                  height: "16px",
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(to bottom,#c8a96e,#b8935a)",
                  border: "1px solid #a07840",
                  borderBottom: "none",
                  boxShadow: "inset 0 1px 0 rgba(255,240,200,0.25)",
                }}
              />
              {/* Thân Folder */}
              <div
                style={{
                  flex: 1,
                  borderRadius: "0 4px 3px 3px",
                  border: "1px solid #9a7040",
                  background:
                    "linear-gradient(155deg,#c9a460,#bb9448 45%,#ad8030)",
                  boxShadow:
                    "0 8px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,240,180,0.18)",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "14px 12px 12px",
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
                {/* Dấu Stamp Niêm Phong */}
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 6,
                    border: "1.5px solid rgba(180,30,30,0.6)",
                    color: "rgba(175,28,28,0.72)",
                    fontFamily: "monospace",
                    fontSize: "0.34rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    padding: "2px 4px",
                    transform: "rotate(10deg)",
                    fontWeight: 900,
                    borderRadius: "2px",
                  }}
                >
                  {f.status}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.42rem",
                      color: "rgba(60,35,5,0.65)",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                    }}
                  >
                    {f.label}
                  </span>
                  <h3
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.62rem",
                      fontWeight: 900,
                      color: "rgba(25,12,0,0.88)",
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
                    background: "rgba(80,45,0,0.18)",
                  }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ẢNH HIỆN TRƯỜNG & VẬT CHỨNG — CUỘN THÌ BAY TỪ BÊN NGOÀI PHẢI VÀO           */}
      {/* ========================================================================= */}
      <div className="block absolute top-[10%] lg:top-[14%] -right-6 sm:right-[-10px] lg:right-0 xl:right-6 w-[200px] sm:w-[230px] lg:w-[260px] h-[320px] lg:h-[380px] pointer-events-none opacity-60 sm:opacity-85 lg:opacity-100 z-10">
        {/* Ảnh 1: Hiện trường Chalk Outline ném từ phải lên */}
        <motion.div
          style={{ x: xRight0, rotate: rotRight0, opacity: opRight0 }}
          className="absolute top-2 right-8 sm:right-12 w-32 sm:w-40 lg:w-44 shadow-2xl hover:rotate-3 hover:z-30 transition-all duration-300 cursor-pointer overflow-hidden z-20 border border-white/20 rounded-xs pointer-events-auto"
        >
          <img
            src="/images/landing/chalk_outline.png"
            alt="Hiện trường phấn trắng"
            className="w-full h-auto object-cover filter contrast-105"
          />
        </motion.div>

        {/* Ảnh 2: Ảnh án mạng phòng kín Polaroid ném từ phải chếch xuống */}
        <motion.div
          style={{ x: xRight1, rotate: rotRight1, opacity: opRight1 }}
          className="absolute top-24 sm:top-28 right-0 sm:right-2 w-36 sm:w-44 lg:w-48 shadow-2xl hover:rotate-[-2deg] hover:z-30 transition-all duration-300 cursor-pointer overflow-hidden z-30 border border-white/25 rounded-xs p-1.5 bg-[#f5ede0] pointer-events-auto"
        >
          <img
            src="/images/cases/case_000/crime_scene.png"
            alt="Ảnh chụp hiện trường vụ án"
            className="w-full h-auto object-cover filter contrast-110"
          />
          <div className="pt-1.5 pb-0.5 text-center font-mono text-[0.5rem] sm:text-[0.55rem] font-bold text-zinc-800 tracking-wider uppercase">
            #EVD-000 // HIỆN TRƯỜNG KHÓA TRÁI
          </div>
        </motion.div>

        {/* Ảnh 3: Mẩu báo rách góc ném từ phải xuống dưới */}
        <motion.div
          style={{ x: xRight2, rotate: rotRight2, opacity: opRight2 }}
          className="absolute top-56 sm:top-64 right-10 sm:right-16 w-28 sm:w-34 lg:w-36 shadow-xl hover:rotate-6 hover:z-30 transition-all duration-300 cursor-pointer overflow-hidden z-10 border border-white/10 rounded-xs pointer-events-auto"
        >
          <img
            src="/images/landing/newspaper_clipping.webp"
            alt="Mẩu báo tài liệu vụ án"
            className="w-full h-auto object-cover filter sepia-[0.25] brightness-90"
          />
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* KHỐI NỘI DUNG CHÍNH (GIỮA)                                                */}
      {/* ========================================================================= */}
      <motion.div
        style={{ opacity: opText, y: yText }}
        className="max-w-xl mx-auto text-center flex flex-col gap-4 items-center z-20 relative"
      >
        <span className="font-mono text-[0.68rem] font-bold uppercase tracking-widest text-amber-400">
          CHUYÊN ÁN HÌNH SỰ ĐẶC BIỆT
        </span>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-foreground tracking-tight leading-tight text-center font-sans">
          Chào mừng các bạn đến với{" "}
          <span className="text-primary font-bold">Tổ Điều Tra Đặc Biệt</span>
        </h2>

        <div className="py-2 px-4 sm:px-6 flex flex-col gap-3 text-xs sm:text-[0.84rem] text-muted-foreground leading-relaxed font-sans text-center">
          <p>
            Khi cảnh sát địa phương hoàn toàn bế tắc trước những kỳ án chấn
            động, tập hồ sơ niêm phong sẽ được chuyển giao thẳng cho nhóm thám
            tử tập sự của bạn. Hãy cùng các cộng sự mở hộp tang vật, phân chia
            nhiệm vụ và đối chiếu từng manh mối nhỏ nhất.
          </p>
        </div>
      </motion.div>
      </div>
    </section>
  );
}
