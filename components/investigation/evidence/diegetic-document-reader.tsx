"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, FileText, Stamp, ShieldAlert, Compass } from "lucide-react";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";

interface DiegeticDocumentReaderProps {
  title: string;
  code: string;
  dossierTitle?: string;
  description?: string;
  className?: string;
}

export function DiegeticDocumentReader({
  title,
  code,
  dossierTitle,
  description,
  className,
}: DiegeticDocumentReaderProps) {
  const [zoom, setZoom] = useState(1);

  const normCode = code?.toUpperCase().replace(/-/g, "");
  const isA01 = normCode === "A01" || title.toLowerCase().includes("cẩm nang");
  const isA04 = normCode === "A04" || title.toLowerCase().includes("khám nghiệm tử thi") || title.toLowerCase().includes("pháp y");
  const isA05 = normCode === "A05" || title.toLowerCase().includes("khám nghiệm hiện trường");

  return (
    <div className={cn("w-full h-full flex flex-col bg-[#0c0805] text-[#e5d8cb] overflow-hidden select-none", className)}>
      {/* Top Toolbar */}
      <div className="shrink-0 h-10 px-4 bg-[#16100a] border-b border-[#2d2015] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#a89078]">
          <FileText className="size-3.5 text-[#e8a86a]" />
          <span className="text-[#e8a86a] font-bold">HỒ SƠ NGHIỆP VỤ #{code}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1f160e] px-2 py-0.5 rounded border border-[#3d2c1e]">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
            disabled={zoom <= 0.7}
            className="p-1 hover:text-[#fef5ec] disabled:opacity-30 transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="font-mono text-xs font-bold text-[#e5d8cb] min-w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
            disabled={zoom >= 1.4}
            className="p-1 hover:text-[#fef5ec] disabled:opacity-30 transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 hover:text-[#fef5ec] transition-colors ml-1"
            title="Đặt lại"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>

      {/* Sheet Canvas Scroll Area */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 sm:p-8 flex justify-center items-start">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          className="w-full max-w-2xl bg-[#f7f3ec] text-[#1b1510] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#d6c7b2] p-8 sm:p-12 relative font-serif transition-transform duration-150"
        >
          {/* Header hành chính */}
          <div className="text-center pb-6 border-b-2 border-[#1b1510] flex flex-col gap-1">
            <p className="text-[11px] font-sans font-bold tracking-widest text-[#3d2c1e] uppercase">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[12px] font-sans font-medium tracking-wide text-[#594231] underline underline-offset-4">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] font-sans text-[#6e533d]">
              <span>CƠ QUAN CSĐT — CÔNG AN TP</span>
              <span className="font-mono font-bold text-[#b91c1c] uppercase border border-[#b91c1c] px-1.5 py-0.5">
                TÀI LIỆU MẬT #{code}
              </span>
            </div>
          </div>

          {/* Tiêu đề tài liệu */}
          <div className="py-6 text-center flex flex-col gap-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-[#1b1510]">
              {title}
            </h1>
            {dossierTitle && (
              <p className="text-xs font-sans text-[#82654c]">
                Bộ hồ sơ lưu trữ: <span className="font-semibold text-[#1b1510]">{dossierTitle}</span>
              </p>
            )}
          </div>

          {/* Nội dung cẩm nang / tài liệu */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#2c221a] font-serif">
            {isA01 ? (
              <>
                <div className="p-3 bg-[#ebe2d3] border-l-4 border-[#8c6b4f] text-xs font-sans text-[#4a3625]">
                  <strong>QUY TRÌNH TIẾP NHẬN VỤ ÁN & CHỈ ĐẠO ĐIỀU TRA:</strong> Yêu cầu Điều tra viên phụ trách tuân thủ nghiêm ngặt 5 bước tác chiến nghiệp vụ ban đầu dưới đây.
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-[#8c6b4f]">1.</span>
                    <p>
                      <strong>Khám nghiệm hiện trường & vật chứng:</strong> Tiến hành rà soát kỹ lưỡng các vật chứng tại hiện trường số 14 Đường Bờ Sông. Khai thác ảnh tư liệu hiện trường để phát hiện dấu vết mâu thuẫn.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-[#8c6b4f]">2.</span>
                    <p>
                      <strong>Khai thác thiết bị số:</strong> Mở khóa và đối chiếu tin nhắn, lịch sử cuộc gọi và dữ liệu ngân hàng trên điện thoại nạn nhân để định vị các mối liên hệ khả nghi.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-[#8c6b4f]">3.</span>
                    <p>
                      <strong>Thẩm tra đối tượng tình nghi:</strong> Triệu tập các nghi can trọng tâm, đối chiếu mâu thuẫn lời khai và chứng cứ ngoại phạm đã thu thập.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-[#8c6b4f]">4.</span>
                    <p>
                      <strong>Thiết lập bảng điều tra:</strong> Nối kết các đường dây quan hệ, làm sáng tỏ động cơ và phương tiện gây án trên Bàn Điều Tra.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-[#8c6b4f]">5.</span>
                    <p>
                      <strong>Hoàn tất hồ sơ cáo trạng:</strong> Kết luận hung thủ và nộp bản cáo trạng chính xác lên Viện Kiểm sát.
                    </p>
                  </div>
                </div>
              </>
            ) : isA04 ? (
              <>
                <div className="p-3 bg-[#ebe2d3] border-l-4 border-[#b91c1c] text-xs font-sans text-[#4a3625]">
                  <strong>KẾT LUẬN GIÁM ĐỊNH PHÁP Y TỬ THI:</strong> Căn cứ biên bản giám định pháp y số 48/GĐPY-TTPY ngày 25/07/2016 đối với tử thi Nguyễn Văn Khang.
                </div>

                <div className="space-y-3 pt-2 text-sm leading-relaxed">
                  <div>
                    <p className="font-bold text-[#1b1510]">I. THÔNG TIN NẠN NHÂN:</p>
                    <p>Họ và tên: <span className="font-semibold">Nguyễn Văn Khang</span> — Sinh ngày: 04/08/1988.</p>
                    <p>Nơi cư trú: Số 14 Đường Bờ Sông, Phường Vĩnh Tuy, TP Hà Nội.</p>
                  </div>

                  <div>
                    <p className="font-bold text-[#1b1510]">II. DẤU VẾT THƯƠNG TÍCH NGOÀI DA:</p>
                    <p>• Vết bầm tím kích thước 3x2cm ở vùng trán trái và gò má, bờ mép không rách da, hình thành do va đập với vật tày diện rộng.</p>
                    <p>• Vùng cổ: Xuất hiện các điểm xuất huyết li ti dưới da; không phát hiện rãnh hằn dây thắt hay vết siết cơ học bằng dây.</p>
                    <p>• Các đầu ngón tay tím tái, niêm mạc mắt và vòm họng xuất huyết dạng chấm điển hình của tình trạng ngạt cấp.</p>
                  </div>

                  <div>
                    <p className="font-bold text-[#1b1510]">III. KẾT LUẬN NGUYÊN NHÂN TỬ VONG:</p>
                    <p>• <strong>Nguyên nhân tử vong:</strong> Ngạt thở cấp do thiếu dưỡng khí trong không gian kín (ngạt cơ học / ngạt khí).</p>
                    <p>• <strong>Thời gian tử vong ước tính:</strong> Trong khoảng từ <span className="font-bold text-[#b91c1c]">20:30 đến 21:00 ngày 24/07/2016</span>.</p>
                    <p>• Không phát hiện nồng độ độc chất hay thuốc an thần trong máu và dịch dạ dày.</p>
                  </div>
                </div>
              </>
            ) : isA05 ? (
              <>
                <div className="p-3 bg-[#ebe2d3] border-l-4 border-[#8c6b4f] text-xs font-sans text-[#4a3625]">
                  <strong>BIÊN BẢN KHÁM NGHIỆM HIỆN TRƯỜNG:</strong> Lập hồi 07:00 ngày 25/07/2016 tại căn nhà cấp 4 số 14 Đường Bờ Sông.
                </div>

                <div className="space-y-3 pt-2 text-sm leading-relaxed">
                  <div>
                    <p className="font-bold text-[#1b1510]">I. TÌNH TRẠNG HIỆN TRƯỜNG:</p>
                    <p>• Cửa chính khép nhưng không khóa chốt trong. Cửa sổ hông hướng ra đường ray tàu hỏa hé mở 15cm.</p>
                    <p>• Phòng khách: Bàn uống nước bị xô lệch, một ấm trà gốm hoa cúc vỡ vụn dưới sàn gạch men, nước chè đã khô quánh, dính vết máu nhỏ văng (ký hiệu mẫu M1).</p>
                    <p>• Phòng ngủ: Chiếc tủ gỗ đứng cao 1m80, then cài kim loại bên ngoài đang ở trạng thái sập chốt đóng chặt.</p>
                  </div>

                  <div>
                    <p className="font-bold text-[#1b1510]">II. TANG VẬT VÀ DẤU VẾT THU GIỮ BAN ĐẦU:</p>
                    <p>1. 01 điện thoại di động iPhone dính dấu vân tay mờ rơi gần chân ghế sô-pha (ký hiệu ev-10).</p>
                    <p>2. Xấp tài liệu giấy tờ liên quan đơn từ tranh chấp quyền sử dụng đất vương vãi trên sàn.</p>
                    <p>3. Các mảnh sành sứ vỡ của ấm trà dính dấu vết sinh học gửi giám định AND phòng KTHS.</p>
                  </div>
                  {/* Nút CTA Khám xét 360 trực tiếp từ biên bản hiện trường */}
                  <div className="mt-4 pt-3 border-t border-[#8c6b4f]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#ebe2d3]/50 p-2.5 rounded">
                    <div className="text-[11px] font-mono text-[#5c4033]">
                      Tư liệu ảnh 360° toàn cảnh hiện trường vụ án:
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        detectiveAudio.playGlassSound();
                        emitInvestigationEvent("OPEN_REINVESTIGATE");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2b170c] hover:bg-[#422413] border border-[#8c6b4f] text-[#f5ebd9] text-xs font-mono font-bold rounded shadow transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                      title="Mở toàn cảnh khám xét hiện trường 360 độ"
                    >
                      <Compass className="size-3.5 text-amber-400" />
                      <span>Khám xét hiện trường 360°</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {description ? (
                  <p className="whitespace-pre-wrap">{description}</p>
                ) : (
                  <p className="italic text-[#7a6452]">
                    Tài liệu nghiệp vụ lưu chiểu chính thức của cơ quan điều tra. Đang được niêm phong theo hồ sơ số {code}.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dấu mộc & Chữ ký */}
          <div className="mt-12 pt-6 border-t border-[#d6c7b2] flex items-center justify-between">
            <div className="flex items-center gap-2 border-2 border-[#b91c1c] text-[#b91c1c] px-3 py-1.5 rounded rotate-[-4deg]">
              <Stamp className="size-4" />
              <div className="flex flex-col text-[10px] font-sans font-bold leading-tight">
                <span>CƠ QUAN CSĐT</span>
                <span>ĐÃ DUYỆT LƯU TRỮ</span>
              </div>
            </div>

            <div className="text-right text-xs font-sans text-[#594231]">
              <p className="font-bold">THỦ TRƯỞNG CƠ QUAN ĐIỀU TRA</p>
              <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
              <div className="h-8 flex items-center justify-end font-serif italic text-base text-[#1b1510] opacity-80">
                Thượng tá Nguyễn Văn Q.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
