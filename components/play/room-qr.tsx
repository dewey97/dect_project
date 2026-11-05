"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR động của phòng (spec 2.3). Render SVG ở client, không gọi dịch vụ ngoài. */
export function RoomQr({ url, size = 176 }: { url: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0d0c0a", light: "#f4efe6" },
    })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div
      role="img"
      aria-label="Mã QR để vào phòng"
      className="rounded-lg bg-[#f4efe6] p-2 [&_svg]:h-full [&_svg]:w-full"
      style={{ width: size, height: size }}
      // SVG do thư viện qrcode sinh từ chính URL của phòng.
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
