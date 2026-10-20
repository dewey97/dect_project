"use client";

import React, { useEffect, useRef } from "react";
import { useEvidenceAnchors } from "./evidence-anchor-context";

interface EvidenceAnchorItemProps {
  code: string; // Mã vật chứng (vd: "CALL-01", "MSG-02", "NOTE-01", "BANK-03")
  children: React.ReactNode;
  className?: string;
}

/**
 * Bọc quanh một dòng (cuộc gọi, tin nhắn, note, chuyển khoản)
 * Tự động tính toán vị trí Y tương đối so với màn hình điện thoại khi người dùng cuộn
 */
export function EvidenceAnchorItem({
  code,
  children,
  className,
}: EvidenceAnchorItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const anchorCtx = useEvidenceAnchors();

  useEffect(() => {
    if (!anchorCtx || !code) return;

    // Đăng ký anchor ban đầu
    anchorCtx.registerAnchor({
      id: code,
      top: 0,
      visible: false,
    });

    const checkPosition = () => {
      const el = itemRef.current;
      if (!el) return;

      // Tìm container màn hình điện thoại chứa dòng này
      const screenContainer = el.closest('[data-phone-screen="true"]');
      if (!screenContainer) return;

      const screenRect = screenContainer.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();

      // Tọa độ Y tương đối so với mép trên của màn hình hiển thị (375x600)
      const relativeTop = itemRect.top - screenRect.top + itemRect.height / 2;

      // Dòng được tính là visible nếu nằm trọn hoặc phần lớn trong khung nhìn màn hình
      // Chừa 40px cho status bar và header trên, 30px cho mép dưới
      const isVisible =
        itemRect.bottom > screenRect.top + 35 &&
        itemRect.top < screenRect.bottom - 20;

      anchorCtx.updateAnchorPos(code, Math.round(relativeTop), isVisible);
    };

    // Kiểm tra ngay khi mount
    checkPosition();

    // Tìm cha có scroll để lắng nghe sự kiện scroll
    const findScrollParent = (node: HTMLElement | null): HTMLElement | null => {
      if (!node) return null;
      if (node.scrollHeight > node.clientHeight && getComputedStyle(node).overflowY !== "visible") {
        return node;
      }
      return findScrollParent(node.parentElement);
    };

    const scrollParent = findScrollParent(itemRef.current);
    const targetToListen = scrollParent || window;

    const handleScroll = () => {
      checkPosition();
    };

    targetToListen.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Kiểm tra thêm một lần sau 150ms để phòng trường hợp DOM render chậm
    const t = setTimeout(checkPosition, 150);

    return () => {
      clearTimeout(t);
      targetToListen.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      anchorCtx.unregisterAnchor(code);
    };
  }, [code, anchorCtx]);

  return (
    <div ref={itemRef} className={className} data-evidence-code={code}>
      {children}
    </div>
  );
}
