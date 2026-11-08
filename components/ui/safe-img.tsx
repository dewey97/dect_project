"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { normalizeImageUrl } from "@/lib/utils";

/**
 * <img> for data-driven URLs (Studio uploads, Drive links). Drive links go
 * through the image proxy. When the file fails: show `fallbackSrc`, or render
 * nothing. Also catches failures that happen before hydration, when React has
 * not attached onError yet.
 */
export function SafeImg({
  src,
  fallbackSrc,
  ...rest
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | null | undefined;
  fallbackSrc?: string;
}) {
  const primary = src ? normalizeImageUrl(src) : "";
  const [current, setCurrent] = useState(primary || fallbackSrc || "");
  const ref = useRef<HTMLImageElement>(null);

  const fail = () => {
    setCurrent((cur) =>
      fallbackSrc && cur !== fallbackSrc ? fallbackSrc : "",
    );
  };

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!current) return null;
  return <img ref={ref} src={current} onError={fail} {...rest} />;
}
