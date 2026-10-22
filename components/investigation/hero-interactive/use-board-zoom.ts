"use client";

import { useCallback, useRef, useState } from "react";
import { useInvestigationEvent } from "@/lib/investigation-events";
import type { Point, Size, ZoomState } from "./types";

interface UseBoardZoomOptions {
  containerSizeRef: React.RefObject<Size>;
  onZoomChange?: () => void;
  onUpdateHoveredPin?: (x: number, y: number) => void;
}

export function useBoardZoom({
  containerSizeRef,
  onZoomChange,
  onUpdateHoveredPin,
}: UseBoardZoomOptions) {
  const [zoomActive, setZoomActive] = useState(false);

  const zoomRef = useRef<ZoomState>({
    active: false,
    originX: 0,
    originY: 0,
  });

  const panRef = useRef<Point>({
    x: 0,
    y: 0,
  });

  const activateZoom = useCallback(
    (screenX: number, screenY: number) => {
      const nextZoom: ZoomState = {
        active: true,
        originX: screenX,
        originY: screenY,
      };

      zoomRef.current = nextZoom;
      panRef.current = { x: 0, y: 0 };

      setZoomActive(true);

      if (onUpdateHoveredPin) {
        onUpdateHoveredPin(screenX, screenY);
      }
      if (onZoomChange) {
        onZoomChange();
      }
    },
    [onUpdateHoveredPin, onZoomChange],
  );

  const resetZoom = useCallback(() => {
    zoomRef.current = {
      active: false,
      originX: 0,
      originY: 0,
    };

    panRef.current = {
      x: 0,
      y: 0,
    };

    setZoomActive(false);

    if (onZoomChange) {
      onZoomChange();
    }
  }, [onZoomChange]);

  const toggleZoomAt = useCallback(
    (screenX: number, screenY: number) => {
      if (zoomRef.current.active) {
        resetZoom();
        return;
      }

      activateZoom(screenX, screenY);
    },
    [activateZoom, resetZoom],
  );

  // Reset zoom & pan automatically whenever the walkthrough tour opens or resets
  useInvestigationEvent("OPEN_WALKTHROUGH", () => {
    resetZoom();
  });
  useInvestigationEvent("RESET_BOARD_VIEW", () => {
    resetZoom();
  });
  useInvestigationEvent("BOARD_ZOOM_IN", () => {
    const { width, height } = containerSizeRef.current || {
      width: 0,
      height: 0,
    };
    activateZoom(width > 0 ? width / 2 : 400, height > 0 ? height / 2 : 300);
  });

  return {
    zoomRef,
    panRef,
    zoomActive,
    setZoomActive,
    activateZoom,
    resetZoom,
    toggleZoomAt,
  };
}
