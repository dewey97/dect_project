"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { findValidCaseCharacter } from "@/lib/cases/case-000-suspects";
import { detectiveAudio } from "@/lib/investigation-audio";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { useInvestigationEvent } from "@/lib/investigation-events";

import type {
  BoardBounds,
  BoardMode,
  CaseConnection,
  CaseData,
  HeroInteractiveProps,
  PinPoint,
  Point,
  Size,
  TooltipState,
  UserConnection,
  UserPin,
  ViewTransform,
  ZoomState,
} from "./hero-interactive/types";
import {
  BOARD_ASPECT,
  BOARD_BASE_HEIGHT,
  BOARD_BASE_WIDTH,
  BOARD_FRAME_SRC,
  CASES_LIST,
  CENTER_LIGHT_RADIUS_RATIO,
  DRAG_THRESHOLD,
  FLASHLIGHT_RADIUS,
  FRAME_INNER_HEIGHT,
  FRAME_INNER_LEFT,
  FRAME_INNER_TOP,
  FRAME_INNER_WIDTH,
  MAX_DEVICE_PIXEL_RATIO,
  MAX_PAN_RATIO,
  PIN_COLORS,
  PIN_GLOW_RADIUS,
  PIN_HIT_RADIUS,
  ZOOM_SCALE,
} from "./hero-interactive/constants";
import {
  clamp,
  distance,
  getInnerBoardBounds,
  getPinWorldPosition,
  getViewTransform,
  isPinHit,
  screenToWorld,
  worldToScreen,
  wrapText,
} from "./hero-interactive/utils";
import {
  getCompositeCard as getCompositeCardHelper,
  getLoadedImage as getLoadedImageHelper,
  resolveSuspectPhotoUrl as resolveSuspectPhotoUrlHelper,
} from "./hero-interactive/card-composite";
export type { HeroInteractiveProps } from "./hero-interactive/types";
export type { PinPoint, CaseConnection, CaseData };

/* Board dataset moved to ./hero-interactive/constants (CASES_LIST). */

/* Board constants moved to ./hero-interactive/constants. */

// ────────────────────────────────────────
// Utility functions
/* Board math helpers moved to ./hero-interactive/utils. */

// ────────────────────────────────────────
// Component
// ────────────────────────────────────────

export function HeroInteractive({
  className,
  controlledCaseId,
  customPins,
  customConnections,
  customBgImage,
  selectedPinId,
  onSelectPin,
  onConnectPins,
  onDeleteConnection,
  onPinClick,
  isEditMode = false,
  onPinPositionChange,
}: HeroInteractiveProps) {
  const customPinsRef = useRef<PinPoint[] | undefined>(customPins);
  const customConnectionsRef = useRef<CaseConnection[] | undefined>(
    customConnections,
  );
  const selectedPinIdRef = useRef<string | null | undefined>(selectedPinId);
  const onSelectPinRef = useRef(onSelectPin);
  const onConnectPinsRef = useRef(onConnectPins);
  const onDeleteConnectionRef = useRef(onDeleteConnection);
  const onPinClickRef = useRef(onPinClick);
  const isEditModeRef = useRef(isEditMode);
  const onPinPositionChangeRef = useRef(onPinPositionChange);

  const draggingPinIdRef = useRef<string | null>(null);
  const isDraggingConnectionRef = useRef<boolean>(false);

  // Synchronously update refs on every render to eliminate any stale closures
  customPinsRef.current = customPins;
  customConnectionsRef.current = customConnections;
  selectedPinIdRef.current = selectedPinId;
  onSelectPinRef.current = onSelectPin;
  onConnectPinsRef.current = onConnectPins;
  onDeleteConnectionRef.current = onDeleteConnection;
  onPinClickRef.current = onPinClick;
  isEditModeRef.current = isEditMode;
  onPinPositionChangeRef.current = onPinPositionChange;

  useEffect(() => {
    if (requestRenderRef.current) requestRenderRef.current();
  }, [customPins, customConnections, selectedPinId, onPinClick]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const boardImageRef = useRef<HTMLImageElement | null>(null);
  const boardFrameRef = useRef<HTMLImageElement | null>(null);

  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskContextRef = useRef<CanvasRenderingContext2D | null>(null);

  const suspectImageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const sheetPhotosMapRef = useRef<Map<string, string>>(new Map());
  const compositeCardCacheRef = useRef<Map<string, HTMLCanvasElement>>(
    new Map(),
  );

  const resolveSuspectPhotoUrl = (pin: {
    id: string;
    label: string;
    photoUrl?: string;
  }): string | undefined =>
    resolveSuspectPhotoUrlHelper(pin, sheetPhotosMapRef.current);

  const getLoadedImage = (
    rawUrl: string,
    fallbackUrl?: string,
  ): HTMLImageElement | null =>
    getLoadedImageHelper(
      rawUrl,
      suspectImageCacheRef.current,
      fallbackUrl,
      () => {
        if (requestRenderRef.current) requestRenderRef.current();
      },
    );

  const getCompositeCard = (
    rawUrl: string,
    label: string,
    fallbackUrl?: string,
  ): HTMLCanvasElement | HTMLImageElement | null =>
    getCompositeCardHelper(
      rawUrl,
      label,
      suspectImageCacheRef.current,
      compositeCardCacheRef.current,
      fallbackUrl,
      () => {
        if (requestRenderRef.current) requestRenderRef.current();
      },
    );

  const containerSizeRef = useRef<Size>({
    width: 0,
    height: 0,
  });

  const devicePixelRatioRef = useRef(1);

  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    active: false,
  });

  const zoomRef = useRef<ZoomState>({
    active: false,
    originX: 0,
    originY: 0,
  });

  const panRef = useRef<Point>({
    x: 0,
    y: 0,
  });

  const pointerDownRef = useRef<Point>({
    x: 0,
    y: 0,
  });

  const panAtPointerDownRef = useRef<Point>({
    x: 0,
    y: 0,
  });

  const activePointerIdRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);

  // Track hovered pin by string ID (or null) to prevent magic number collisions
  const hoveredPinRef = useRef<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const renderSceneRef = useRef<((timestamp: number) => void) | null>(null);

  const requestRenderRef = useRef<() => void>(() => undefined);

  const reducedMotionRef = useRef(false);

  const [zoomActive, setZoomActive] = useState(false);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Inner board bounds in screen-space (for positioning HTML overlays)
  const [innerRect, setInnerRect] = useState<BoardBounds | null>(null);

  // ── Case and mode states ──
  const [internalCaseId, setInternalCaseId] = useState<string>("case-000");
  const currentCaseId = controlledCaseId ?? internalCaseId;
  const [boardMode, setBoardMode] = useState<BoardMode>("zoom");

  // ── Live Google Sheets Photos Integration ──
  const { data: sheetPhotos } = usePhoneData(
    "photos",
    currentCaseId || "case-000",
  );

  const sheetPhotosMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!sheetPhotos || sheetPhotos.length === 0) return map;
    for (const item of sheetPhotos) {
      const liveUrl = (item.direct_cdn_url || item.drive_url || "").trim();
      if (!liveUrl) continue;
      const normalized = normalizeImageUrl(liveUrl);
      if (item.photo_code) {
        const pc = item.photo_code.toLowerCase().trim();
        map.set(pc, normalized);
        if (pc.startsWith("avatar_")) {
          map.set(pc.replace("avatar_", ""), normalized);
        }
        if (
          pc === "crime_scene" ||
          pc === "chalk_outline" ||
          pc === "thi_the" ||
          pc.includes("chalk")
        ) {
          map.set("crime_scene", normalized);
          map.set("chalk_outline", normalized);
          map.set("thi_the", normalized);
        }
      }
      if (item.title) {
        const titleLower = item.title.toLowerCase().trim();
        map.set(titleLower, normalized);
        // Also map clean name from title (e.g. "Ảnh chân dung Lê Quang Vũ" -> "vũ", "lê quang vũ")
        if (titleLower.includes("khang")) map.set("khang", normalized);
        if (titleLower.includes("vũ") || titleLower.includes("vu"))
          map.set("vu", normalized);
        if (titleLower.includes("tùng") || titleLower.includes("tung"))
          map.set("tung", normalized);
        if (titleLower.includes("hà") || titleLower.includes("ha"))
          map.set("ha", normalized);
        if (titleLower.includes("mai")) map.set("mai", normalized);
        if (titleLower.includes("đạt") || titleLower.includes("dat"))
          map.set("dat", normalized);
        if (titleLower.includes("lụa") || titleLower.includes("lua"))
          map.set("lua", normalized);
        if (titleLower.includes("vy")) map.set("vy", normalized);
        if (titleLower.includes("tiến") || titleLower.includes("tien"))
          map.set("tien", normalized);
        if (
          titleLower.includes("thi thể") ||
          titleLower.includes("thi-the") ||
          titleLower.includes("chalk") ||
          (titleLower.includes("hiện trường") &&
            !titleLower.includes("phòng khách"))
        ) {
          map.set("crime_scene", normalized);
          map.set("chalk_outline", normalized);
          map.set("thi_the", normalized);
        }
      }
    }
    return map;
  }, [sheetPhotos]);

  useEffect(() => {
    sheetPhotosMapRef.current = sheetPhotosMap;
    if (requestRenderRef.current) requestRenderRef.current();
  }, [sheetPhotosMap]);

  const activeCase =
    CASES_LIST.find((c) => c.id === currentCaseId) || CASES_LIST[0];
  const activeCaseRef = useRef<CaseData>(activeCase);

  // Sync activeCaseRef instantly
  useEffect(() => {
    activeCaseRef.current = activeCase;
    nextUserPinNumberRef.current = 1;
  }, [activeCase]);

  const [userPins, setUserPins] = useState<UserPin[]>([]);
  const [userConnections, setUserConnections] = useState<UserConnection[]>([]);
  const [connectionStartId, setConnectionStartId] = useState<string | null>(
    null,
  );

  // Refs for animation loop to access up-to-date state instantly
  const userPinsRef = useRef<UserPin[]>([]);
  const userConnectionsRef = useRef<UserConnection[]>([]);
  const connectionStartIdRef = useRef<string | null>(null);
  const connectionCandidateRef = useRef(false);

  // Pin counter sequence ref
  const nextUserPinNumberRef = useRef(1);

  // Synchronous ref updating wrapper functions to avoid requestRender reading stale state
  const updateUserPins = useCallback(
    (updater: UserPin[] | ((prev: UserPin[]) => UserPin[])) => {
      const prev = userPinsRef.current;
      const next = typeof updater === "function" ? updater(prev) : updater;
      userPinsRef.current = next;
      setUserPins(next);
      requestRenderRef.current();
    },
    [],
  );

  const updateUserConnections = useCallback(
    (
      updater:
        UserConnection[] | ((prev: UserConnection[]) => UserConnection[]),
    ) => {
      const prev = userConnectionsRef.current;
      const next = typeof updater === "function" ? updater(prev) : updater;
      userConnectionsRef.current = next;
      setUserConnections(next);
      requestRenderRef.current();
    },
    [],
  );

  const updateConnectionStartId = useCallback((val: string | null) => {
    connectionStartIdRef.current = val;
    setConnectionStartId(val);
    requestRenderRef.current();
  }, []);

  // ────────────────────────────────────────
  // Tooltip and hover
  // ────────────────────────────────────────

  const updateHoveredPin = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bounds = getInnerBoardBounds(
      rect.width,
      rect.height,
      boardFrameRef.current,
    );
    const transform = getViewTransform(zoomRef.current, panRef.current);
    const worldPointer = screenToWorld({ x: screenX, y: screenY }, transform);

    const caseSysPins = customPinsRef.current ?? activeCaseRef.current.pins;
    let hitId: string | null = null;

    // Iterate backwards so topmost visual pin is hit first
    for (let index = caseSysPins.length - 1; index >= 0; index -= 1) {
      const pin = caseSysPins[index];
      const pinPosition = getPinWorldPosition(pin, bounds);
      if (isPinHit(worldPointer, pinPosition, pin, transform, bounds)) {
        hitId = pin.id;
        break;
      }
    }

    if (hoveredPinRef.current !== hitId) {
      hoveredPinRef.current = hitId;
      requestRenderRef.current();
    }

    if (containerRef.current) {
      if (isDraggingConnectionRef.current) {
        containerRef.current.style.cursor = "crosshair";
      } else if (draggingPinIdRef.current) {
        containerRef.current.style.cursor = "grabbing";
      } else if (hitId) {
        containerRef.current.style.cursor = "pointer";
      } else if (isEditModeRef.current) {
        containerRef.current.style.cursor = "grab";
      } else {
        containerRef.current.style.cursor = "default";
      }
    }
  }, []);

  // ────────────────────────────────────────
  // Zoom controls
  // ────────────────────────────────────────

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

      updateHoveredPin(screenX, screenY);
      requestRenderRef.current();
    },
    [updateHoveredPin],
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

    if (pointerRef.current.active) {
      updateHoveredPin(pointerRef.current.x, pointerRef.current.y);
    } else {
      hoveredPinRef.current = null;
      setTooltip(null);
    }

    requestRenderRef.current();
  }, [updateHoveredPin]);

  // Reset zoom & pan automatically whenever the walkthrough tour opens
  useInvestigationEvent("OPEN_WALKTHROUGH", () => {
    resetZoom();
  });

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

  // Unified wrapper to transition safely to Pin Mode
  const switchToPinMode = useCallback(() => {
    isPointerDownRef.current = false;
    activePointerIdRef.current = null;
    hasDraggedRef.current = false;

    updateConnectionStartId(null);
    resetZoom();
    setBoardMode("pin");
  }, [resetZoom, updateConnectionStartId]);

  // ────────────────────────────────────────
  // Pointer events
  // ────────────────────────────────────────

  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Avoid interactions bubble triggered from UI elements
      const target = event.target as HTMLElement;
      if (target.closest("[data-board-ui]")) {
        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      activePointerIdRef.current = event.pointerId;
      isPointerDownRef.current = true;
      hasDraggedRef.current = false;

      pointerDownRef.current = { x, y };
      panAtPointerDownRef.current = {
        ...panRef.current,
      };

      pointerRef.current = {
        x,
        y,
        active: true,
      };

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}

      const bounds = getInnerBoardBounds(
        rect.width,
        rect.height,
        boardFrameRef.current,
      );

      const transform = getViewTransform(zoomRef.current, panRef.current);
      const worldPointer = screenToWorld({ x, y }, transform);
      const scaleFactor = bounds.width / BOARD_BASE_WIDTH;

      // Check if clicking on a system pin in edit mode
      if (isEditModeRef.current) {
        const caseSysPins = customPinsRef.current ?? activeCaseRef.current.pins;

        // Ưu tiên 1: nắm đinh ghim (đầu ghim) để kéo dây chỉ đỏ nối 2 node
        // Duyệt ngược để bắt đúng node nằm trên cùng (khớp với hover & render)
        const headRadius = (18 * scaleFactor) / transform.scale;
        for (let index = caseSysPins.length - 1; index >= 0; index -= 1) {
          const pin = caseSysPins[index];
          const pinPosition = getPinWorldPosition(pin, bounds);

          if (
            distance(
              worldPointer.x,
              worldPointer.y,
              pinPosition.x,
              pinPosition.y,
            ) <= headRadius
          ) {
            // Chưa bật kéo dây ngay: chờ xem người dùng có di chuột hay chỉ
            // bấm (click) vào đầu ghim. Phân biệt ở handlePointerMove.
            connectionStartIdRef.current = pin.id;
            connectionCandidateRef.current = true;
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {}
            requestRenderRef.current();
            try {
              event.preventDefault();
              event.stopPropagation();
            } catch {}
            return;
          }
        }

        // Ưu tiên 2: thân ghim → kéo di chuyển node
        for (let index = caseSysPins.length - 1; index >= 0; index -= 1) {
          const pin = caseSysPins[index];
          const pinPosition = getPinWorldPosition(pin, bounds);

          if (isPinHit(worldPointer, pinPosition, pin, transform, bounds)) {
            draggingPinIdRef.current = pin.id;
            dragOffsetRef.current = {
              x: worldPointer.x - pinPosition.x,
              y: worldPointer.y - pinPosition.y,
            };
            detectiveAudio.playPaperRustle();
            requestRenderRef.current();
            try {
              event.preventDefault();
              event.stopPropagation();
            } catch {}
            return;
          }
        }
      }

      updateHoveredPin(x, y);
    },
    [updateHoveredPin, updateConnectionStartId],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      pointerRef.current = {
        x,
        y,
        active: true,
      };

      const isActivePointer =
        activePointerIdRef.current === event.pointerId ||
        activePointerIdRef.current === null;

      if (
        isPointerDownRef.current &&
        isActivePointer &&
        connectionCandidateRef.current
      ) {
        const deltaX = x - pointerDownRef.current.x;
        const deltaY = y - pointerDownRef.current.y;
        const dragDistance = Math.hypot(deltaX, deltaY);

        if (dragDistance > DRAG_THRESHOLD) {
          hasDraggedRef.current = true;
          if (
            !isDraggingConnectionRef.current &&
            connectionStartIdRef.current
          ) {
            isDraggingConnectionRef.current = true;
            updateConnectionStartId(connectionStartIdRef.current);
            detectiveAudio.playTypewriterClick();
          }
        }
      }

      if (
        isPointerDownRef.current &&
        isActivePointer &&
        draggingPinIdRef.current &&
        isEditModeRef.current &&
        onPinPositionChangeRef.current
      ) {
        hasDraggedRef.current = true;
        const bounds = getInnerBoardBounds(
          rect.width,
          rect.height,
          boardFrameRef.current,
        );
        const transform = getViewTransform(zoomRef.current, panRef.current);
        const worldPointer = screenToWorld({ x, y }, transform);

        const targetWorldX = worldPointer.x - dragOffsetRef.current.x;
        const targetWorldY = worldPointer.y - dragOffsetRef.current.y;

        const normalizedX = clamp(
          (targetWorldX - bounds.x) / bounds.width,
          0,
          1,
        );
        const normalizedY = clamp(
          (targetWorldY - bounds.y) / bounds.height,
          0,
          1,
        );

        onPinPositionChangeRef.current(
          draggingPinIdRef.current,
          normalizedX,
          normalizedY,
        );
        requestRenderRef.current();
        try {
          event.preventDefault();
          event.stopPropagation();
        } catch {}
        return;
      } else if (
        isPointerDownRef.current &&
        isActivePointer &&
        zoomRef.current.active
      ) {
        const deltaX = x - pointerDownRef.current.x;
        const deltaY = y - pointerDownRef.current.y;

        const dragDistance = Math.hypot(deltaX, deltaY);

        if (dragDistance > DRAG_THRESHOLD) {
          hasDraggedRef.current = true;
        }

        const { width, height } = containerSizeRef.current;

        const maxPanX = width * MAX_PAN_RATIO;
        const maxPanY = height * MAX_PAN_RATIO;

        panRef.current = {
          x: clamp(panAtPointerDownRef.current.x + deltaX, -maxPanX, maxPanX),
          y: clamp(panAtPointerDownRef.current.y + deltaY, -maxPanY, maxPanY),
        };
      }

      updateHoveredPin(x, y);
      requestRenderRef.current();
    },
    [updateHoveredPin],
  );

  const finishPointerInteraction = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, allowInteraction: boolean) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-board-ui]")) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        draggingPinIdRef.current = null;
        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        draggingPinIdRef.current = null;
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      isPointerDownRef.current = false;
      activePointerIdRef.current = null;

      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {}

      const wasDraggingPin = draggingPinIdRef.current !== null;
      draggingPinIdRef.current = null;

      const wasDraggingConn = isDraggingConnectionRef.current;
      const fromConnPinId = connectionStartIdRef.current;
      connectionCandidateRef.current = false;
      isDraggingConnectionRef.current = false;
      updateConnectionStartId(null);

      // Check if user actually dragged/panned
      const isDrag = hasDraggedRef.current;
      hasDraggedRef.current = false;

      // Xử lý kết nối dây chỉ đỏ khi thả chuột (chỉ khi ĐÃ KÉO THẢ THẬT SỰ)
      if (wasDraggingConn && fromConnPinId && isDrag) {
        const bounds = getInnerBoardBounds(
          rect.width,
          rect.height,
          boardFrameRef.current,
        );
        const transform = getViewTransform(zoomRef.current, panRef.current);
        const worldPointer = screenToWorld({ x, y }, transform);
        const caseSysPins = customPinsRef.current ?? activeCaseRef.current.pins;

        let targetPin: PinPoint | null = null;
        let minD = Infinity;
        for (let index = 0; index < caseSysPins.length; index += 1) {
          const pin = caseSysPins[index];
          const pinPosition = getPinWorldPosition(pin, bounds);
          if (isPinHit(worldPointer, pinPosition, pin, transform, bounds)) {
            const d = distance(
              worldPointer.x,
              worldPointer.y,
              pinPosition.x,
              pinPosition.y,
            );
            if (d < minD) {
              minD = d;
              targetPin = pin;
            }
          }
        }

        if (
          targetPin &&
          targetPin.id !== fromConnPinId &&
          onConnectPinsRef.current
        ) {
          onConnectPinsRef.current(fromConnPinId, targetPin.id);
          detectiveAudio.playTypewriterClick();
        }

        requestRenderRef.current();
        try {
          event.preventDefault();
          event.stopPropagation();
        } catch {}
        return;
      }

      // Ghim bị kéo thật sự thì coi như thao tác di chuyển, không mở hộp thoại
      if (wasDraggingPin && isDrag) {
        try {
          event.preventDefault();
          event.stopPropagation();
        } catch {}
        return;
      }

      if (allowInteraction && !isDrag) {
        const bounds = getInnerBoardBounds(
          rect.width,
          rect.height,
          boardFrameRef.current,
        );

        const transform = getViewTransform(zoomRef.current, panRef.current);
        const worldPointer = screenToWorld({ x, y }, transform);

        const caseSysPins = customPinsRef.current ?? activeCaseRef.current.pins;
        let bestHitPin: PinPoint | null = null;

        // Check all system/custom pins in reverse order (topmost z-index visual element hits first)
        for (let index = caseSysPins.length - 1; index >= 0; index -= 1) {
          const pin = caseSysPins[index];
          const pinPosition = getPinWorldPosition(pin, bounds);

          if (isPinHit(worldPointer, pinPosition, pin, transform, bounds)) {
            bestHitPin = pin;
            break;
          }
        }

        if (bestHitPin) {
          if (isEditModeRef.current && onSelectPinRef.current) {
            onSelectPinRef.current(bestHitPin.id);
          }
          if (onPinClickRef.current) {
            try {
              event.preventDefault();
              event.stopPropagation();
            } catch {}
            onPinClickRef.current(bestHitPin.id, bestHitPin, {
              clientX: event.clientX,
              clientY: event.clientY,
            });
          }
        } else if (isEditModeRef.current && onSelectPinRef.current) {
          onSelectPinRef.current(null);
        }
      } else {
        updateHoveredPin(x, y);
      }

      requestRenderRef.current();
    },
    [
      toggleZoomAt,
      updateHoveredPin,
      boardMode,
      updateUserPins,
      updateUserConnections,
      updateConnectionStartId,
    ],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishPointerInteraction(event, true);
    },
    [finishPointerInteraction],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishPointerInteraction(event, false);
    },
    [finishPointerInteraction],
  );

  const handlePointerLeave = useCallback(() => {
    if (isPointerDownRef.current) {
      return;
    }

    pointerRef.current = {
      x: -1000,
      y: -1000,
      active: false,
    };
    hoveredPinRef.current = null;
    setTooltip(null);
    requestRenderRef.current();
  }, []);

  // ────────────────────────────────────────
  // Sync external controlled case id
  // ────────────────────────────────────────
  useEffect(() => {
    if (controlledCaseId && controlledCaseId !== internalCaseId) {
      setInternalCaseId(controlledCaseId);
      updateUserPins([]);
      updateUserConnections([]);
      updateConnectionStartId(null);
      hoveredPinRef.current = null;
      setTooltip(null);
    }
  }, [
    controlledCaseId,
    internalCaseId,
    updateUserPins,
    updateUserConnections,
    updateConnectionStartId,
  ]);

  // ────────────────────────────────────────
  // Animation & Setup
  // ────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !container || !context) {
      return;
    }

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      reducedMotionRef.current = mediaQuery.matches;
      requestRenderRef.current();
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Re-render when web fonts (Caveat, Playpen Sans) finish loading
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (requestRenderRef.current) {
          requestRenderRef.current();
        }
      });
    }

    const maskCanvas = document.createElement("canvas");

    const maskContext = maskCanvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();

      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      const devicePixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
      );

      containerSizeRef.current = {
        width,
        height,
      };

      devicePixelRatioRef.current = devicePixelRatio;

      canvas.width = Math.round(width * devicePixelRatio);

      canvas.height = Math.round(height * devicePixelRatio);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      if (maskContext) {
        maskCanvas.width = Math.round(width * devicePixelRatio);

        maskCanvas.height = Math.round(height * devicePixelRatio);

        maskContext.setTransform(
          devicePixelRatio,
          0,
          0,
          devicePixelRatio,
          0,
          0,
        );
      }

      // Update inner bounds rect for HTML overlay positioning
      const ib = getInnerBoardBounds(width, height, boardFrameRef.current);
      setInnerRect(ib);

      requestRenderRef.current();
    };

    const renderScene = (timestamp: number) => {
      const { width, height } = containerSizeRef.current;

      if (width <= 0 || height <= 0) {
        return;
      }

      const devicePixelRatio = devicePixelRatioRef.current;

      /*
       * Reset transform trước khi clear để đảm bảo xóa toàn bộ
       * pixel buffer, sau đó đưa context về hệ tọa độ CSS pixel.
       */
      context.setTransform(1, 0, 0, 1, 0, 0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const image = boardImageRef.current;
      const frameImg = boardFrameRef.current;

      // Calculate frame "cover" fit (maintain aspect ratio, fill canvas, crop overflow)
      let frameDx = 0,
        frameDy = 0,
        frameDw = width,
        frameDh = height;
      if (frameImg && frameImg.width > 0 && frameImg.height > 0) {
        const frameAspect = frameImg.width / frameImg.height;
        const canvasAspect = width / height;
        if (canvasAspect > frameAspect) {
          // Canvas is wider → match width, crop top/bottom
          frameDw = width;
          frameDh = width / frameAspect;
          frameDx = 0;
          frameDy = (height - frameDh) / 2;
        } else {
          // Canvas is taller → match height, crop left/right
          frameDh = height;
          frameDw = height * frameAspect;
          frameDx = (width - frameDw) / 2;
          frameDy = 0;
        }
      }

      // Use the shared bounds calculation so pins align with click targets
      const bounds = getInnerBoardBounds(width, height, frameImg);

      const transform = getViewTransform(zoomRef.current, panRef.current);

      const pointer = pointerRef.current;

      const worldPointer = screenToWorld(
        {
          x: pointer.x,
          y: pointer.y,
        },
        transform,
      );

      // ──────────────────────────────────
      // 1. Draw transformed board scene (Full-bleed Map content)
      // ──────────────────────────────────

      // 1.1 Fill desk background behind corkboard
      context.fillStyle = "#0c0805";
      context.fillRect(0, 0, width, height);

      context.save();

      // Apply zoom & pan transform ONLY for the inner map contents
      context.translate(transform.translateX, transform.translateY);
      context.scale(transform.scale, transform.scale);

      const scaleFactor = bounds.width / BOARD_BASE_WIDTH;

      // 1.2 Draw tactile drop shadow under the corkboard
      context.save();
      context.shadowColor = "rgba(0, 0, 0, 0.75)";
      context.shadowBlur = 24 * scaleFactor;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 10 * scaleFactor;
      context.fillStyle = "#1e140c";
      context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      context.restore();

      // Draw case evidence map with refined focus on corkboard surface
      if (image) {
        // Crop ~11.5-12% margin for subtle reduction vs original
        const cropMarginX = image.width * 0.12;
        const cropMarginY = image.height * 0.11;
        const sx = cropMarginX;
        const sy = cropMarginY;
        const sw = image.width - cropMarginX * 2;
        const sh = image.height - cropMarginY * 2;

        context.drawImage(
          image,
          sx,
          sy,
          sw,
          sh,
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
        );

        // Differentiate case 2 & 3 test overlays visually
        if (currentCaseId === "case-02") {
          // Lab Green overlay tint
          context.save();
          context.globalCompositeOperation = "multiply";
          context.fillStyle = "rgba(40, 180, 80, 0.28)";
          context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
          context.restore();
        } else if (currentCaseId === "case-03") {
          // Cyber Cyan overlay tint
          context.save();
          context.globalCompositeOperation = "multiply";
          context.fillStyle = "rgba(0, 195, 255, 0.28)";
          context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
          context.restore();
        }
      } else {
        context.fillStyle = "#3d2e1e";
        context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }

      // Build unified list of pins for mapping coordinates
      const casePins = customPinsRef.current ?? activeCaseRef.current.pins;
      const uPins = userPinsRef.current;
      const allPinsUnified = [
        ...casePins.map((p) => ({
          ...p,
          id: p.id,
          x: p.x,
          y: p.y,
          label: p.label,
          detail: (p as any).detail,
          color: (p as any).color,
          noteColor: (p as any).noteColor,
          pinColor: (p as any).pinColor,
          pulseBorder: (p as any).pulseBorder,
          photoUrl: (p as any).photoUrl,
          noteTextureUrl: (p as any).noteTextureUrl,
          rotation: (p as any).rotation,
          scale: (p as any).scale,
          isLocked: (p as any).isLocked,
          isSolved: (p as any).isSolved,
          isUser: false,
        })),
        ...uPins.map((p) => ({
          ...p,
          id: p.id,
          x: p.x,
          y: p.y,
          label: p.label,
          color: "yellow" as const,
          noteColor: "yellow" as const,
          pinColor: "yellow" as const,
          pulseBorder: false,
          photoUrl: undefined,
          isLocked: false,
          isSolved: false,
          isUser: true,
        })),
      ];

      const pinPositionsMap = new Map<string, Point>();
      allPinsUnified.forEach((pin) => {
        pinPositionsMap.set(pin.id, {
          x: bounds.x + pin.x * bounds.width,
          y: bounds.y + pin.y * bounds.height,
        });
      });

      // ──────────────────────────────────
      // 2. Layer 1: Draw Paper Cards & Polaroid Photos (Bottom Layer)
      // ──────────────────────────────────
      allPinsUnified.forEach((pin) => {
        const pinPosition = pinPositionsMap.get(pin.id);
        if (!pinPosition) return;

        // Note styling: defaults to 3M Canary yellow paper styling, or dark charcoal if black
        const noteThemeType =
          pin.noteColor || (pin.color === "black" ? "black" : "yellow");

        let paperTheme = {
          paperBgTop: "#fae67a",
          paperBgMid: "#f6dc68",
          paperBgBottom: "#eed056",
          paperBorder: "rgba(180, 140, 40, 0.35)",
          textColor: "#1a1208",
          inkBleed: "rgba(26, 18, 8, 0.15)",
        };

        if (noteThemeType === "black") {
          paperTheme = {
            paperBgTop: "#282522",
            paperBgMid: "#1c1917",
            paperBgBottom: "#12100e",
            paperBorder: "rgba(255, 255, 255, 0.22)",
            textColor: "#f5eee4",
            inkBleed: "rgba(255, 255, 255, 0.12)",
          };
        }

        // Calculate a subtle organic size variation for each item + user custom scale
        const charSum = pin.id
          .split("")
          .reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 3), 0);
        const sizeVariant = ((charSum % 7) - 3) * 0.024;
        const rawPin = pin as any;
        const userScale =
          typeof rawPin.scale === "number" && rawPin.scale > 0
            ? rawPin.scale
            : 1.0;
        const scaleMod = (1.0 + sizeVariant) * userScale;

        const isCustomPin =
          pin.id.startsWith("admin-pin-") || pin.id.startsWith("custom-pin-");

        const isAvatarPin =
          pin.id.startsWith("node-suspect-") ||
          pin.id.startsWith("suspect-") ||
          pin.id === "c0-pin-victim-khang" ||
          Boolean(
            findValidCaseCharacter(pin.label) || findValidCaseCharacter(pin.id),
          );

        const isPhotoPin =
          isAvatarPin ||
          Boolean(rawPin.photoUrl) ||
          pin.id.includes("thi-the") ||
          pin.id.includes("crime-scene") ||
          pin.id === "c0-pin-victim-phone";

        context.save();
        context.translate(pinPosition.x, pinPosition.y);

        // Apply custom rotation angle if specified
        if (typeof rawPin.rotation === "number") {
          context.rotate((rawPin.rotation * Math.PI) / 180);
        }

        if (isPhotoPin) {
          const char =
            findValidCaseCharacter(pin.label) || findValidCaseCharacter(pin.id);
          const fallbackUrl =
            char?.avatarUrl ||
            (pin.id.includes("crime-scene") ||
            pin.id.includes("thi-the") ||
            pin.id.includes("chalk")
              ? "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png"
              : pin.id.includes("phone")
                ? "/phone.png"
                : "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png");
          const photoUrl =
            rawPin.photoUrl || resolveSuspectPhotoUrl(pin) || fallbackUrl;

          // AVATAR pins get Polaroid composite with tape & name.
          // EVIDENCE/SCENE photos load raw image directly (natural aspect ratio, no tape, no text overlay).
          const loadedSuspectImg = photoUrl
            ? isAvatarPin
              ? getCompositeCard(photoUrl, pin.label || "NẠN NHÂN", fallbackUrl)
              : getLoadedImage(photoUrl, fallbackUrl)
            : null;

          if (loadedSuspectImg) {
            const imgW =
              (loadedSuspectImg as HTMLImageElement).naturalWidth ||
              (loadedSuspectImg as any).width ||
              300;
            const imgH =
              (loadedSuspectImg as HTMLImageElement).naturalHeight ||
              (loadedSuspectImg as any).height ||
              380;
            const isVictimPhone =
              pin.id === "c0-pin-victim-phone" ||
              (pin.id.includes("phone") &&
                pin.id !== "c0-pin-phone" &&
                Boolean((pin as any).photoUrl));
            const isKhang =
              !isVictimPhone &&
              (pin.id.includes("khang") ||
                (pin.label && pin.label.toLowerCase().includes("khang")));
            const isCrimeScene =
              pin.id.includes("crime-scene") ||
              pin.id.includes("thi-the") ||
              (pin.label && pin.label.toLowerCase().includes("thi thể"));
            const baseCardWidth = isKhang
              ? 204
              : isCrimeScene
                ? 186
                : isVictimPhone
                  ? 135
                  : 158;
            const cardWidth =
              (baseCardWidth * scaleFactor * scaleMod) / transform.scale;
            const cardHeight = (cardWidth * imgH) / imgW;

            const tagX = -cardWidth / 2;
            const tagY = isCrimeScene
              ? -cardHeight * 0.05
              : isVictimPhone
                ? -cardHeight * 0.04
                : -cardHeight * 0.1;

            // Pass 1 — wide ambient occlusion: soft halo lifting the card off the corkboard
            context.save();
            context.shadowColor = "rgba(10, 5, 2, 0.34)";
            context.shadowBlur = (22 * scaleFactor) / transform.scale;
            context.shadowOffsetX = (1.5 * scaleFactor) / transform.scale;
            context.shadowOffsetY = (9 * scaleFactor) / transform.scale;
            context.drawImage(
              loadedSuspectImg,
              tagX,
              tagY,
              cardWidth,
              cardHeight,
            );
            context.restore();

            // Pass 2 — tight contact shadow: crisp dark edge right under the paper
            context.save();
            context.shadowColor = "rgba(10, 5, 2, 0.58)";
            context.shadowBlur = (7 * scaleFactor) / transform.scale;
            context.shadowOffsetX = (2.6 * scaleFactor) / transform.scale;
            context.shadowOffsetY = (5.2 * scaleFactor) / transform.scale;

            // Render complete pre-rendered photo card (includes photo, beige tape + name, yellow pin)
            context.drawImage(
              loadedSuspectImg,
              tagX,
              tagY,
              cardWidth,
              cardHeight,
            );
            context.restore();
          } else {
            // Lightweight fallback while image is loading
            const isKhang =
              pin.id.includes("khang") ||
              (pin.label && pin.label.toLowerCase().includes("khang"));
            const isCrimeScene =
              pin.id.includes("crime-scene") ||
              pin.id.includes("thi-the") ||
              (pin.label && pin.label.toLowerCase().includes("thi thể"));
            const baseCardWidth = isKhang ? 204 : isCrimeScene ? 186 : 158;
            const baseCardHeight = isCrimeScene
              ? (baseCardWidth * 420) / 560
              : (baseCardWidth * 380) / 300;
            const cardWidth =
              (baseCardWidth * scaleFactor * scaleMod) / transform.scale;
            const cardHeight =
              (baseCardHeight * scaleFactor * scaleMod) / transform.scale;
            context.fillStyle = "#f5f2eb";
            context.fillRect(-cardWidth / 2, 0, cardWidth, cardHeight);
          }

          // Hover / Selected border & glow highlight on photo card
          const isPhotoHovered = hoveredPinRef.current === pin.id;
          const isPhotoSelected = selectedPinIdRef.current === pin.id;
          if (isPhotoHovered || isPhotoSelected) {
            const isVictimPhone =
              pin.id === "c0-pin-victim-phone" ||
              (pin.id.includes("phone") &&
                pin.id !== "c0-pin-phone" &&
                Boolean((pin as any).photoUrl));
            const isKhang =
              !isVictimPhone &&
              (pin.id.includes("khang") ||
                (pin.label && pin.label.toLowerCase().includes("khang")));
            const isCrimeScene =
              pin.id.includes("crime-scene") ||
              pin.id.includes("thi-the") ||
              (pin.label && pin.label.toLowerCase().includes("thi thể"));
            const baseCardWidth = isKhang
              ? 204
              : isCrimeScene
                ? 186
                : isVictimPhone
                  ? 135
                  : 158;
            const cardWidth =
              (baseCardWidth * scaleFactor * scaleMod) / transform.scale;
            const cardHeight = loadedSuspectImg
              ? (cardWidth *
                  ((loadedSuspectImg as HTMLImageElement).naturalHeight ||
                    (loadedSuspectImg as any).height ||
                    380)) /
                ((loadedSuspectImg as HTMLImageElement).naturalWidth ||
                  (loadedSuspectImg as any).width ||
                  300)
              : cardWidth * 1.3;
            const tagX = -cardWidth / 2;
            const tagY = isCrimeScene
              ? -cardHeight * 0.05
              : isVictimPhone
                ? -cardHeight * 0.04
                : -cardHeight * 0.1;

            context.save();
            if (isPhotoSelected) {
              context.shadowColor = "rgba(245, 158, 11, 0.95)";
              context.shadowBlur = (18 * scaleFactor) / transform.scale;
              context.strokeStyle = "#f59e0b";
              context.lineWidth = (2.8 * scaleFactor) / transform.scale;
            } else {
              context.shadowColor = "rgba(251, 191, 36, 0.8)";
              context.shadowBlur = (12 * scaleFactor) / transform.scale;
              context.strokeStyle = "#fbbf24";
              context.lineWidth = (2 * scaleFactor) / transform.scale;
            }
            context.strokeRect(tagX, tagY, cardWidth, cardHeight);

            if (isEditModeRef.current) {
              const handleSize = (6 * scaleFactor) / transform.scale;
              context.fillStyle = isPhotoSelected ? "#f59e0b" : "#fbbf24";
              context.fillRect(
                tagX - handleSize / 2,
                tagY - handleSize / 2,
                handleSize,
                handleSize,
              );
              context.fillRect(
                tagX + cardWidth - handleSize / 2,
                tagY - handleSize / 2,
                handleSize,
                handleSize,
              );
              context.fillRect(
                tagX - handleSize / 2,
                tagY + cardHeight - handleSize / 2,
                handleSize,
                handleSize,
              );
              context.fillRect(
                tagX + cardWidth - handleSize / 2,
                tagY + cardHeight - handleSize / 2,
                handleSize,
                handleSize,
              );
            }
            context.restore();
          }
        } else {
          // ── DISTINGUISH WHITE PINNED NOTES vs YELLOW STICKY NOTES ──
          const upperLabel = (pin.label || "").toUpperCase();
          const isWhiteNote =
            (pin as any).noteColor === "white" ||
            upperLabel.includes("MỞ RỘNG") ||
            upperLabel.includes("KHÁM XÉT") ||
            upperLabel.includes("KHÁM NGHIỆM") ||
            upperLabel.includes("KẾT LUẬN") ||
            upperLabel.includes("BIÊN BẢN") ||
            upperLabel.includes("TRUY TỐ");

          let noteUrl = "";
          let isPreRendered = false;

          const customTextureUrl = (pin as any).noteTextureUrl as
            string | undefined;

          if (isCustomPin) {
            if (customTextureUrl) {
              noteUrl = customTextureUrl;
              isPreRendered = customTextureUrl.includes("rendered_notes/");
            } else if (isWhiteNote) {
              const whiteVariants = [
                "/images/cases/case_000/clue_notes/clean_note_white_1.png",
                "/images/cases/case_000/clue_notes/clean_note_white_2.png",
                "/images/cases/case_000/clue_notes/clean_note_white_3.png",
                "/images/cases/case_000/clue_notes/clean_note_white_4.png",
                "/images/cases/case_000/clue_notes/clean_note_white_5.png",
                "/images/cases/case_000/clue_notes/clean_note_white_6.png",
                "/images/cases/case_000/clue_notes/clean_note_white_7.png",
                "/images/cases/case_000/clue_notes/clean_note_white_8.png",
                "/images/cases/case_000/clue_notes/clean_note_white_9.png",
                "/images/cases/case_000/clue_notes/clean_note_white_10.png",
                "/images/cases/case_000/clue_notes/clean_note_white_11.png",
              ];
              const hash = (pin.id || "")
                .split("")
                .reduce((acc, c) => acc + c.charCodeAt(0), 0);
              noteUrl = whiteVariants[Math.abs(hash) % whiteVariants.length];
              isPreRendered = false;
            } else {
              const yellowVariants = [
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_1.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_2.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_3.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_4.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_5.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_6.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_7.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_8.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_9.png",
                "/images/cases/case_000/clue_notes/clean_sticky_yellow_10.png",
              ];
              const hash = (pin.id || "")
                .split("")
                .reduce((acc, c) => acc + c.charCodeAt(0), 0);
              noteUrl = yellowVariants[Math.abs(hash) % yellowVariants.length];
              isPreRendered = false;
            }
          } else if (customTextureUrl) {
            noteUrl = customTextureUrl;
            isPreRendered = customTextureUrl.includes("rendered_notes/");
          } else if (
            pin.id === "c0-pin-evidence" ||
            upperLabel.includes("CHỨNG CỨ")
          ) {
            noteUrl =
              "/images/cases/case_000/clue_notes/rendered_notes/note_bo_sung_chung_cu.png";
            isPreRendered = true;
          } else if (
            pin.id === "c0-pin-suspects" ||
            upperLabel.includes("NGHI PHẠM")
          ) {
            noteUrl =
              "/images/cases/case_000/clue_notes/rendered_notes/note_nghi_pham.png";
            isPreRendered = true;
          } else if (
            pin.id === "c0-pin-followup-vu" ||
            pin.id === "c0-pin-followup-tung" ||
            pin.id === "c0-pin-followup-ha" ||
            pin.id === "c0-pin-question" ||
            pin.id.startsWith("c0-pin-followup") ||
            upperLabel.includes("NGHI VẤN") ||
            upperLabel.includes("CÂU HỎI")
          ) {
            noteUrl =
              "/images/cases/case_000/clue_notes/rendered_notes/note_nghi_van.png";
            isPreRendered = true;
          } else if (
            pin.id === "c0-pin-phone" ||
            upperLabel.includes("MỞ RỘNG")
          ) {
            noteUrl =
              "/images/cases/case_000/clue_notes/rendered_notes/note_mo_rong_dieu_tra.png";
            isPreRendered = true;
          } else if (
            pin.id === "c0-pin-reinvestigate" ||
            upperLabel.includes("KHÁM XÉT") ||
            upperLabel.includes("KHÁM NGHIỆM")
          ) {
            noteUrl =
              "/images/cases/case_000/clue_notes/rendered_notes/note_kham_xet_lai.png";
            isPreRendered = true;
          } else if (
            pin.id === "c0-pin-indictment" ||
            upperLabel.includes("KẾT LUẬN") ||
            upperLabel.includes("TRUY TỐ")
          ) {
            noteUrl =
              "/images/cases/case_000/clue_notes/rendered_notes/note_ket_luan_dieu_tra.png";
            isPreRendered = true;
          } else if (isWhiteNote) {
            const whiteVariants = [
              "/images/cases/case_000/clue_notes/clean_note_white_1.png",
              "/images/cases/case_000/clue_notes/clean_note_white_2.png",
              "/images/cases/case_000/clue_notes/clean_note_white_3.png",
              "/images/cases/case_000/clue_notes/clean_note_white_4.png",
              "/images/cases/case_000/clue_notes/clean_note_white_5.png",
              "/images/cases/case_000/clue_notes/clean_note_white_6.png",
              "/images/cases/case_000/clue_notes/clean_note_white_7.png",
              "/images/cases/case_000/clue_notes/clean_note_white_8.png",
              "/images/cases/case_000/clue_notes/clean_note_white_9.png",
              "/images/cases/case_000/clue_notes/clean_note_white_10.png",
              "/images/cases/case_000/clue_notes/clean_note_white_11.png",
            ];
            const hash = (pin.id || "")
              .split("")
              .reduce((acc, c) => acc + c.charCodeAt(0), 0);
            noteUrl = whiteVariants[Math.abs(hash) % whiteVariants.length];
          } else {
            const yellowVariants = [
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_1.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_2.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_3.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_4.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_5.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_6.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_7.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_8.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_9.png",
              "/images/cases/case_000/clue_notes/clean_sticky_yellow_10.png",
            ];
            const hash = (pin.id || "")
              .split("")
              .reduce((acc, c) => acc + c.charCodeAt(0), 0);
            noteUrl = yellowVariants[Math.abs(hash) % yellowVariants.length];
          }

          const loadedNoteImg = getLoadedImage(noteUrl);

          const isIndictment =
            pin.id === "c0-pin-indictment" || upperLabel.includes("KẾT LUẬN");
          const isFollowup =
            pin.id.startsWith("c0-pin-followup") ||
            pin.id.startsWith("followup-");
          const sizeMultiplier = 1.0;

          // Note size: preserve aspect ratio cleanly without distortion
          const baseCardWidth = isFollowup ? 144 : isWhiteNote ? 142 : 115;
          const noteWidth =
            (baseCardWidth * scaleFactor * scaleMod * sizeMultiplier) /
            transform.scale;

          let noteHeight = noteWidth;
          if (
            loadedNoteImg &&
            loadedNoteImg.naturalWidth &&
            loadedNoteImg.naturalHeight
          ) {
            noteHeight =
              (noteWidth * loadedNoteImg.naturalHeight) /
              loadedNoteImg.naturalWidth;
          } else {
            noteHeight =
              noteWidth * (isFollowup ? 0.92 : isWhiteNote ? 1.18 : 1.0);
          }

          let pinAnchorX = 0.5;
          let pinAnchorY = 0.08;

          if (pin.id === "c0-pin-evidence" || upperLabel.includes("CHỨNG CỨ")) {
            pinAnchorX = 0.5;
            pinAnchorY = 0.08;
          } else if (
            pin.id === "c0-pin-suspects" ||
            upperLabel.includes("NGHI PHẠM")
          ) {
            pinAnchorX = 0.5;
            pinAnchorY = 0.08;
          } else if (
            pin.id === "c0-pin-followup-vu" ||
            pin.id === "c0-pin-followup-tung" ||
            pin.id === "c0-pin-followup-ha" ||
            pin.id === "c0-pin-question" ||
            upperLabel.includes("NGHI VẤN") ||
            upperLabel.includes("CÂU HỎI")
          ) {
            pinAnchorX = 0.5;
            pinAnchorY = 0.08;
          } else if (
            pin.id === "c0-pin-phone" ||
            upperLabel.includes("MỞ RỘNG")
          ) {
            pinAnchorX = 0.5;
            pinAnchorY = 0.075;
          } else if (
            pin.id === "c0-pin-reinvestigate" ||
            upperLabel.includes("KHÁM XÉT") ||
            upperLabel.includes("KHÁM NGHIỆM")
          ) {
            pinAnchorX = 0.5;
            pinAnchorY = 0.075;
          } else if (
            pin.id === "c0-pin-indictment" ||
            upperLabel.includes("KẾT LUẬN")
          ) {
            pinAnchorX = 0.5;
            pinAnchorY = 0.075;
          }

          const tagX = -noteWidth * pinAnchorX;
          const tagY = -noteHeight * pinAnchorY;

          // Draw the realistic Ultra HD note PNG asset with tactile 2-pass drop shadow onto corkboard
          if (loadedNoteImg) {
            // Pass 1 — ambient occlusion lift
            context.save();
            context.shadowColor = "rgba(10, 5, 2, 0.30)";
            context.shadowBlur = (18 * scaleFactor) / transform.scale;
            context.shadowOffsetX = (1.2 * scaleFactor) / transform.scale;
            context.shadowOffsetY = (8 * scaleFactor) / transform.scale;
            context.drawImage(loadedNoteImg, tagX, tagY, noteWidth, noteHeight);
            context.restore();

            // Pass 2 — crisp contact edge
            context.save();
            context.shadowColor = "rgba(10, 5, 2, 0.52)";
            context.shadowBlur = (6.5 * scaleFactor) / transform.scale;
            context.shadowOffsetX = (2.4 * scaleFactor) / transform.scale;
            context.shadowOffsetY = (4.6 * scaleFactor) / transform.scale;
            context.drawImage(loadedNoteImg, tagX, tagY, noteWidth, noteHeight);
            context.restore();
          } else {
            // Fallback fill
            context.save();
            context.shadowColor = "rgba(10, 5, 2, 0.48)";
            context.shadowBlur = (12 * scaleFactor) / transform.scale;
            context.shadowOffsetX = (2.2 * scaleFactor) / transform.scale;
            context.shadowOffsetY = (6 * scaleFactor) / transform.scale;
            context.fillStyle = isWhiteNote ? "#faf8f2" : "#fde047";
            context.fillRect(tagX, tagY, noteWidth, noteHeight);
            context.restore();
          }

          // Pulsing border highlight if active
          if ((pin as any).pulseBorder) {
            const pulseGlow = (Math.sin(timestamp / 220) + 1) / 2;
            context.save();
            context.shadowColor = `rgba(245, 158, 11, ${0.45 + pulseGlow * 0.55})`;
            context.shadowBlur =
              ((8 + pulseGlow * 12) * scaleFactor) / transform.scale;
            context.strokeStyle = `rgba(253, 224, 71, ${0.75 + pulseGlow * 0.25})`;
            context.lineWidth =
              ((2.2 + pulseGlow * 1.5) * scaleFactor) / transform.scale;
            context.strokeRect(tagX, tagY, noteWidth, noteHeight);
            context.restore();
          }

          // Amber dashed border highlight when hovered (admin edit mode)
          const isNoteHovered = hoveredPinRef.current === pin.id;
          const isNoteSelected = selectedPinIdRef.current === pin.id;

          if (isNoteHovered || isNoteSelected) {
            context.save();
            const pad = (3 * scaleFactor) / transform.scale;
            const bx = tagX - pad;
            const by = tagY - pad;
            const bw = noteWidth + pad * 2;
            const bh = noteHeight + pad * 2;

            if (isNoteSelected) {
              context.shadowColor = "rgba(245, 158, 11, 0.95)";
              context.shadowBlur = (18 * scaleFactor) / transform.scale;
              context.strokeStyle = "#f59e0b";
              context.lineWidth = (2.8 * scaleFactor) / transform.scale;
            } else {
              context.shadowColor = "rgba(251, 191, 36, 0.85)";
              context.shadowBlur = (12 * scaleFactor) / transform.scale;
              context.strokeStyle = "#fbbf24";
              context.lineWidth = (2 * scaleFactor) / transform.scale;
            }

            context.setLineDash([
              (6 * scaleFactor) / transform.scale,
              (4 * scaleFactor) / transform.scale,
            ]);
            context.strokeRect(bx, by, bw, bh);
            context.setLineDash([]);

            if (isEditModeRef.current) {
              const handleSize = (6 * scaleFactor) / transform.scale;
              context.fillStyle = isNoteSelected ? "#f59e0b" : "#fbbf24";
              context.fillRect(
                bx - handleSize / 2,
                by - handleSize / 2,
                handleSize,
                handleSize,
              );
              context.fillRect(
                bx + bw - handleSize / 2,
                by - handleSize / 2,
                handleSize,
                handleSize,
              );
              context.fillRect(
                bx - handleSize / 2,
                by + bh - handleSize / 2,
                handleSize,
                handleSize,
              );
              context.fillRect(
                bx + bw - handleSize / 2,
                by + bh - handleSize / 2,
                handleSize,
                handleSize,
              );
            }
            context.restore();
          }

          // Render handwritten text (only if not using pre-rendered note asset or while loading)
          if (!isPreRendered || !loadedNoteImg) {
            const paperFaceCenterX = tagX + noteWidth / 2;
            const paperFaceCenterY = tagY + noteHeight * 0.52;
            const maxTextWidth = noteWidth * (isWhiteNote ? 0.65 : 0.72);
            const availableHeight = noteHeight * (isWhiteNote ? 0.55 : 0.6);

            let fontSize =
              (isIndictment ? 15.5 : isWhiteNote ? 14.5 : 14.0) * scaleFactor;
            context.font = `700 ${fontSize / transform.scale}px 'Caveat', 'Playpen Sans', 'Segoe Print', cursive, sans-serif`;
            let lines = wrapText(context, pin.label, maxTextWidth, 3);

            while (
              fontSize > 9.0 * scaleFactor &&
              (lines.some((l) => context.measureText(l).width > maxTextWidth) ||
                lines.length *
                  ((fontSize + 1.5 * scaleFactor) / transform.scale) >
                  availableHeight)
            ) {
              fontSize -= 0.5 * scaleFactor;
              context.font = `700 ${fontSize / transform.scale}px 'Caveat', 'Playpen Sans', 'Segoe Print', cursive, sans-serif`;
              lines = wrapText(context, pin.label, maxTextWidth, 3);
            }

            const lineHeight = (fontSize + 1.5 * scaleFactor) / transform.scale;
            const textBlockHeight = lines.length * lineHeight;

            context.save();
            context.translate(paperFaceCenterX, paperFaceCenterY);
            context.fillStyle = "#1e1b18";
            context.textAlign = "center";
            context.textBaseline = "middle";

            const textStartY = -textBlockHeight / 2 + lineHeight / 2;
            lines.forEach((line, lineIdx) => {
              context.fillText(line, 0, textStartY + lineIdx * lineHeight);
            });
            context.restore();
          }

          // Lock overlay and text if pin is locked
          if (pin.isLocked) {
            context.save();
            context.fillStyle = "rgba(15, 10, 8, 0.68)";
            context.fillRect(tagX, tagY, noteWidth, noteHeight);

            // Plain white text, larger, centered
            context.font = `900 ${(15.0 * scaleFactor) / transform.scale}px 'Courier New', monospace, sans-serif`;
            context.fillStyle = "#ffffff";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.shadowColor = "rgba(0, 0, 0, 0.95)";
            context.shadowBlur = (4 * scaleFactor) / transform.scale;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = (1 * scaleFactor) / transform.scale;
            context.fillText(
              "CHỜ PHÊ DUYỆT",
              tagX + noteWidth / 2,
              tagY + noteHeight * 0.62,
            );
            context.restore();
          }

          // Dấu tick '✓' kiểu font chữ viết tay, chỉ hiển thị duy nhất trên node 'Mở rộng điều tra' khi đã giải xong
          const isPhoneNode =
            pin.id === "c0-pin-phone" ||
            (pin.label || "").toUpperCase().includes("MỞ RỘNG");
          if (pin.isSolved && isPhoneNode) {
            context.save();
            const centerX = tagX + noteWidth / 2;
            const centerY = tagY + noteHeight * 0.62;
            const tickFontSize = (noteHeight * 0.32) / transform.scale;

            context.font = `900 ${tickFontSize}px 'Playpen Sans', 'Caveat', 'Segoe Print', 'Patrick Hand', cursive, sans-serif`;
            context.fillStyle = "#1a120b";
            context.textAlign = "center";
            context.textBaseline = "middle";

            // Subtle handwriting ink shadow
            context.shadowColor = "rgba(0, 0, 0, 0.22)";
            context.shadowBlur = (1.5 * scaleFactor) / transform.scale;
            context.shadowOffsetX = (0.6 * scaleFactor) / transform.scale;
            context.shadowOffsetY = (0.6 * scaleFactor) / transform.scale;

            context.fillText("✓", centerX, centerY);
            context.restore();
          }
        }

        context.restore(); // restore paper / polaroid transform

        // Pinhole puncture (Skip for victim phone evidence item which already has physical evidence bag pins)
        const isVictimPhone = pin.id === "c0-pin-victim-phone";
        if (!isVictimPhone) {
          context.save();
          context.fillStyle = "rgba(35, 20, 10, 0.85)";
          context.beginPath();
          context.arc(
            pinPosition.x,
            pinPosition.y,
            (1.6 * scaleFactor) / transform.scale,
            0,
            Math.PI * 2,
          );
          context.fill();
          context.restore();
        }
      });

      // ──────────────────────────────────
      // 3. Layer 2: Draw Evidence Strings & Connecting Lines (ON TOP OF CARDS)
      // ──────────────────────────────────
      const caseConns =
        customConnectionsRef.current ?? activeCaseRef.current.connections;
      caseConns.forEach((conn) => {
        const start = pinPositionsMap.get(conn.fromPinId);
        const end = pinPositionsMap.get(conn.toPinId);
        if (!start || !end) return;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.hypot(dx, dy);

        // Organic curve matching orientation (gravity sag for horizontal, natural curve for vertical)
        const isMostlyVertical = Math.abs(dy) > Math.abs(dx) * 1.4;
        let middleX = (start.x + end.x) / 2;
        let middleY = (start.y + end.y) / 2;

        if (isMostlyVertical) {
          const bow =
            (dx >= 0 ? -1 : 1) *
            Math.min((10 * scaleFactor) / transform.scale, dist * 0.04);
          middleX += bow;
        } else {
          const sag = Math.max(
            (8 * scaleFactor) / transform.scale,
            Math.min((30 * scaleFactor) / transform.scale, dist * 0.08),
          );
          middleY += sag;
        }

        // Subtle thin string shadow onto cards/board
        context.save();
        context.strokeStyle = "rgba(0, 0, 0, 0.20)";
        context.lineWidth = (1.0 * scaleFactor) / transform.scale;
        context.shadowColor = "rgba(0, 0, 0, 0.25)";
        context.shadowBlur = (2.5 * scaleFactor) / transform.scale;
        context.beginPath();
        context.moveTo(
          start.x + (0.8 * scaleFactor) / transform.scale,
          start.y + (1.2 * scaleFactor) / transform.scale,
        );
        context.quadraticCurveTo(
          middleX + (0.8 * scaleFactor) / transform.scale,
          middleY + (1.2 * scaleFactor) / transform.scale,
          end.x + (0.8 * scaleFactor) / transform.scale,
          end.y + (1.2 * scaleFactor) / transform.scale,
        );
        context.stroke();
        context.restore();

        // Fine Crimson Yarn thread (thin & elegant)
        context.save();
        context.strokeStyle = "rgba(200, 35, 35, 0.85)";
        context.lineWidth = (1.15 * scaleFactor) / transform.scale;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(middleX, middleY, end.x, end.y);
        context.stroke();
        context.restore();
      });

      // User custom connections
      const uConns = userConnectionsRef.current;
      uConns.forEach((conn) => {
        const start = pinPositionsMap.get(conn.fromPinId);
        const end = pinPositionsMap.get(conn.toPinId);
        if (!start || !end) return;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.hypot(dx, dy);
        const sag = Math.max(
          18 * scaleFactor,
          Math.min(50 * scaleFactor, dist * 0.09),
        );

        const middleX = (start.x + end.x) / 2;
        const middleY = (start.y + end.y) / 2 + sag;

        // Custom string shadow
        context.save();
        context.strokeStyle = "rgba(0, 0, 0, 0.22)";
        context.lineWidth = (1.0 * scaleFactor) / transform.scale;
        context.beginPath();
        context.moveTo(
          start.x + (0.8 * scaleFactor) / transform.scale,
          start.y + (1.2 * scaleFactor) / transform.scale,
        );
        context.quadraticCurveTo(
          middleX + (0.8 * scaleFactor) / transform.scale,
          middleY + (1.2 * scaleFactor) / transform.scale,
          end.x + (0.8 * scaleFactor) / transform.scale,
          end.y + (1.2 * scaleFactor) / transform.scale,
        );
        context.stroke();
        context.restore();

        // Custom user connection fine crimson thread
        context.save();
        context.strokeStyle = "rgba(225, 45, 45, 0.85)";
        context.lineWidth = (1.1 * scaleFactor) / transform.scale;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(middleX, middleY, end.x, end.y);
        context.stroke();
        context.restore();
      });

      // Active connector wire while dragging (Glowing Crimson Yarn Thread)
      if (connectionStartIdRef.current && pointer.active) {
        const start = pinPositionsMap.get(connectionStartIdRef.current);
        if (start) {
          const pointerWorld = screenToWorld(
            { x: pointer.x, y: pointer.y },
            transform,
          );
          context.save();
          context.shadowColor = "rgba(220, 38, 38, 0.9)";
          context.shadowBlur = (8 * scaleFactor) / transform.scale;
          context.strokeStyle = "rgba(239, 68, 68, 0.95)";
          context.lineWidth = (2.0 * scaleFactor) / transform.scale;
          context.setLineDash([
            (5 * scaleFactor) / transform.scale,
            (3 * scaleFactor) / transform.scale,
          ]);
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(pointerWorld.x, pointerWorld.y);
          context.stroke();
          context.restore();
        }
      }

      // ──────────────────────────────────
      // 4. Layer 3: Draw Realistic 3D Pushpins (ON TOP OF STRINGS & CARDS)
      // ──────────────────────────────────
      allPinsUnified.forEach((pin) => {
        const pinPosition = pinPositionsMap.get(pin.id);
        if (!pinPosition) return;
        if (pin.id === "c0-pin-victim-phone") return; // Evidence bag item already has self-contained pins, no overlay pushpin

        const isEvidencePin =
          pin.id === "c0-pin-evidence" ||
          (pin.label && pin.label.toLowerCase().includes("bổ sung chứng cứ"));
        const isSuspectPin =
          pin.id === "c0-pin-suspects" ||
          pin.id.includes("suspect") ||
          (pin.label && pin.label.toLowerCase().includes("nghi phạm"));
        const isIndictmentPin =
          pin.id === "c0-pin-indictment" ||
          (pin.label && pin.label.toLowerCase().includes("kết luận"));

        const rawColor =
          pin.pinColor ||
          (isEvidencePin || isSuspectPin || isIndictmentPin ? "red" : "yellow");

        const isRedPin = rawColor === "red";
        const colorKey = rawColor === "black" ? "dark" : rawColor;

        // Strict orientation: Inverted according to user preference
        const boardCenterX = bounds.x + bounds.width / 2;
        const isLeftHalf =
          pin.x !== undefined ? pin.x < 0.5 : pinPosition.x < boardCenterX;
        const isFlipped = isLeftHalf;

        const pinUrl = isFlipped
          ? `/images/pins/pin-${colorKey}-flipped.png`
          : `/images/pins/pin-${colorKey}.png`;
        const pinImg =
          getLoadedImage(pinUrl) ||
          getLoadedImage(`/images/pins/pin-${colorKey}.png`);

        if (pinImg && pinImg.complete && pinImg.naturalWidth > 0) {
          // Uniform size for all pins
          const pinDisplayWidth = (32 * scaleFactor) / transform.scale;
          const pinDisplayHeight =
            pinDisplayWidth * (pinImg.naturalHeight / pinImg.naturalWidth);

          // Align the needle piercing point with pinPosition (piercing tip enters board at pinPosition)
          const drawX =
            pinPosition.x - pinDisplayWidth * (isFlipped ? 0.49 : 0.51);
          const drawY = pinPosition.y - pinDisplayHeight * 0.7;

          context.save();
          if (isRedPin && (pin.pulseBorder ?? true)) {
            // Subtle glowing aura for main investigation target
            context.shadowColor = "rgba(239, 68, 68, 0.75)";
            context.shadowBlur = (10 * scaleFactor) / transform.scale;
          }
          context.drawImage(
            pinImg,
            drawX,
            drawY,
            pinDisplayWidth,
            pinDisplayHeight,
          );
          context.restore();
        } else {
          // Fallback procedural canvas render while asset loads
          const baseRadius = (6.8 * scaleFactor) / transform.scale;
          let headTheme = {
            headBase: "#dc2626",
            headMid: "#b91c1c",
            headHighlight: "#fca5a5",
            headRim: "#7f1d1d",
          };

          if (colorKey === "yellow" || colorKey === "brass") {
            headTheme = {
              headBase: "#d97706",
              headMid: "#b45309",
              headHighlight: "#fde047",
              headRim: "#78350f",
            };
          } else if (colorKey === "blue" || colorKey === "cyan") {
            headTheme = {
              headBase: "#0284c7",
              headMid: "#0369a1",
              headHighlight: "#7dd3fc",
              headRim: "#0c4a6e",
            };
          } else if (colorKey === "green") {
            headTheme = {
              headBase: "#16a34a",
              headMid: "#15803d",
              headHighlight: "#86efac",
              headRim: "#14532d",
            };
          } else if (colorKey === "dark") {
            headTheme = {
              headBase: "#27272a",
              headMid: "#18181b",
              headHighlight: "#a1a1aa",
              headRim: "#09090b",
            };
          }

          context.save();
          context.fillStyle = "rgba(0, 0, 0, 0.45)";
          context.beginPath();
          context.ellipse(
            pinPosition.x +
              ((isRedPin ? 2.2 : 1.8) * scaleFactor) / transform.scale,
            pinPosition.y +
              ((isRedPin ? 3.0 : 2.5) * scaleFactor) / transform.scale,
            baseRadius * 0.9,
            baseRadius * 0.55,
            0,
            0,
            Math.PI * 2,
          );
          context.fill();
          context.restore();

          context.save();
          const pinGradient = context.createRadialGradient(
            pinPosition.x - baseRadius * 0.32,
            pinPosition.y - baseRadius * 0.32,
            baseRadius * 0.05,
            pinPosition.x,
            pinPosition.y,
            baseRadius,
          );
          pinGradient.addColorStop(0, headTheme.headHighlight);
          pinGradient.addColorStop(0.35, headTheme.headBase);
          pinGradient.addColorStop(0.75, headTheme.headMid);
          pinGradient.addColorStop(1, headTheme.headRim);
          context.fillStyle = pinGradient;
          context.beginPath();
          context.arc(pinPosition.x, pinPosition.y, baseRadius, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }
      });

      context.restore();

      // ──────────────────────────────────
      // 4. Dark mask & vignette removed for full natural clarity
      // ──────────────────────────────────
    };

    renderSceneRef.current = renderScene;

    let lastRenderTime = 0;
    const requestRender = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(
        function renderFrame(timestamp) {
          animationFrameRef.current = null;

          const hasPulsingPins = (
            customPinsRef.current ?? activeCaseRef.current.pins
          ).some((p) => (p as any).pulseBorder);

          const shouldContinueAnimating =
            !reducedMotionRef.current &&
            (hoveredPinRef.current !== null ||
              connectionStartIdRef.current !== null ||
              hasPulsingPins);

          if (!shouldContinueAnimating || timestamp - lastRenderTime >= 33) {
            renderSceneRef.current?.(timestamp);
            lastRenderTime = timestamp;
          } else if (shouldContinueAnimating) {
            // Need to keep requesting frame to wait for next 33ms interval
            animationFrameRef.current =
              window.requestAnimationFrame(renderFrame);
            return;
          }

          if (shouldContinueAnimating) {
            requestRender();
          }
        },
      );
    };

    requestRenderRef.current = requestRender;

    const resizeObserver = new ResizeObserver(resizeCanvas);

    resizeObserver.observe(container);

    resizeCanvas();

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      resizeObserver.disconnect();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = null;
      renderSceneRef.current = null;
      requestRenderRef.current = () => undefined;
    };
  }, [updateHoveredPin]);

  // Effect 2: Load wooden frame once on mount
  useEffect(() => {
    const frameImage = new Image();
    frameImage.src = BOARD_FRAME_SRC;
    frameImage.onload = () => {
      boardFrameRef.current = frameImage;
      // Recalculate inner bounds now that frame dimensions are known
      const { width, height } = containerSizeRef.current;
      if (width > 0 && height > 0) {
        setInnerRect(getInnerBoardBounds(width, height, frameImage));
      }
      requestRenderRef.current();
    };
    frameImage.onerror = () => {
      console.error(`Không thể tải ảnh khung gỗ bối cảnh: ${BOARD_FRAME_SRC}`);
    };
  }, []);

  const bgImageToUse = customBgImage ?? activeCase.bgImage;

  // Effect 3: Load active case background map with cancellation support to avoid race conditions
  useEffect(() => {
    let cancelled = false;

    boardImageRef.current = null;
    requestRenderRef.current();

    const boardImage = new Image();
    boardImage.src = bgImageToUse;
    boardImage.onload = () => {
      if (cancelled) return;
      boardImageRef.current = boardImage;
      requestRenderRef.current();
    };
    boardImage.onerror = () => {
      if (cancelled) return;
      console.error(`Không thể tải ảnh bản đồ vụ án: ${bgImageToUse}`);
      boardImageRef.current = null;
      requestRenderRef.current();
    };

    return () => {
      cancelled = true;
    };
  }, [bgImageToUse]);

  // ────────────────────────────────────────
  // Tooltip style
  // ────────────────────────────────────────

  const tooltipStyle: CSSProperties | undefined = tooltip
    ? {
        position: "absolute",
        left: tooltip.x,
        top: tooltip.y,
        transform: "translate(-50%, -140%)",
        pointerEvents: "none",
      }
    : undefined;

  return (
    <div
      className={cn(
        "flex h-full w-full flex-1 min-h-0 flex-col overflow-hidden rounded-none border-0 bg-[#0a0705]",
        className,
      )}
    >
      {/* Main Canvas view area container */}
      <div
        ref={containerRef}
        tabIndex={0}
        role="application"
        aria-label={
          boardMode === "zoom"
            ? zoomActive
              ? "Bảng bằng chứng đang phóng to. Kéo để di chuyển."
              : "Bảng bằng chứng ở chế độ zoom."
            : "Bảng bằng chứng ở chế độ ghim và nối dây. Click vùng trống để thêm ghim, click ghim để nối hoặc tháo dây."
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        className={cn(
          "relative flex-1 min-h-0 w-full overflow-hidden",
          "select-none touch-none",
          isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-default",
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary/70",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          zoomActive && "cursor-grab active:cursor-grabbing",
        )}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
