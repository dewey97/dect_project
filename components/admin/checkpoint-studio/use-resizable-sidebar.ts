"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "checkpoint_studio_sidebar_width";
const MIN = 320;
const MAX = 900;

/**
 * Width of the right inspector, dragged from its left edge and remembered in
 * localStorage. `startResizing` goes on the drag handle's onMouseDown.
 */
export function useResizableSidebar(initialWidth = 420) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (saved) setSidebarWidth(Math.max(MIN, Math.min(800, saved)));
    } catch {
      // storage blocked: keep the default width
    }
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth - e.clientX;
      if (width >= MIN && width <= MAX) setSidebarWidth(width);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem(STORAGE_KEY, String(sidebarWidth));
      } catch {
        // ignore
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  return { sidebarWidth, isResizing, startResizing };
}
