"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";
import type {
  BoardBounds,
  CaseConnection,
  CaseData,
  HeroInteractiveProps,
  PinPoint,
  Size,
  TooltipState,
  UserConnection,
  UserPin,
} from "./hero-interactive/types";
import {
  BOARD_FRAME_SRC,
  CASES_LIST,
  MAX_DEVICE_PIXEL_RATIO,
} from "./hero-interactive/constants";
import { getInnerBoardBounds } from "./hero-interactive/utils";
import {
  getCompositeCard as getCompositeCardHelper,
  getLoadedImage as getLoadedImageHelper,
  resolveSuspectPhotoUrl as resolveSuspectPhotoUrlHelper,
} from "./hero-interactive/card-composite";
import { useLivePinPhotos } from "./hero-interactive/use-live-pin-photos";
import { useBoardZoom } from "./hero-interactive/use-board-zoom";
import { useBoardPointer } from "./hero-interactive/use-board-pointer";
import { renderScene } from "./hero-interactive/render-scene";

export type { HeroInteractiveProps } from "./hero-interactive/types";
export type { PinPoint, CaseConnection, CaseData };

// ────────────────────────────────────────
// Component
// ────────────────────────────────────────

export function HeroInteractive({
  className,
  controlledCaseId,
  caseId: propCaseId,
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
  lightConeConfig,
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
  const lightConeConfigRef = useRef(lightConeConfig);

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
  lightConeConfigRef.current = lightConeConfig;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const boardImageRef = useRef<HTMLImageElement | null>(null);
  const boardFrameRef = useRef<HTMLImageElement | null>(null);

  const suspectImageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const compositeCardCacheRef = useRef<Map<string, HTMLCanvasElement>>(
    new Map(),
  );

  const containerSizeRef = useRef<Size>({
    width: 0,
    height: 0,
  });

  const devicePixelRatioRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const renderSceneCallbackRef = useRef<((timestamp: number) => void) | null>(
    null,
  );
  const requestRenderRef = useRef<() => void>(() => undefined);
  const reducedMotionRef = useRef(false);

  // ── Case and mode states ──
  const [internalCaseId, setInternalCaseId] = useState<string>("case-000");
  const currentCaseId = controlledCaseId ?? propCaseId ?? internalCaseId;

  // ── Live Google Sheets Photos Integration ──
  const { sheetPhotosMapRef } = useLivePinPhotos(
    currentCaseId || "case-000",
    () => {
      if (requestRenderRef.current) requestRenderRef.current();
    },
  );

  const resolveSuspectPhotoUrl = useCallback(
    (pin: {
      id: string;
      label: string;
      photoUrl?: string;
    }): string | undefined =>
      resolveSuspectPhotoUrlHelper(
        pin,
        sheetPhotosMapRef.current,
        currentCaseId,
      ),
    [sheetPhotosMapRef, currentCaseId],
  );

  const getLoadedImage = useCallback(
    (rawUrl: string, fallbackUrl?: string): HTMLImageElement | null =>
      getLoadedImageHelper(
        rawUrl,
        suspectImageCacheRef.current,
        fallbackUrl,
        () => {
          if (requestRenderRef.current) requestRenderRef.current();
        },
      ),
    [],
  );

  const getCompositeCard = useCallback(
    (
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
      ),
    [],
  );

  const activeCase = CASES_LIST.find((c) => c.id === currentCaseId) || {
    id: currentCaseId,
    title: currentCaseId,
    description: "",
    status: "active" as const,
    bgImage:
      customBgImage || "/images/backgrounds/corkboard_vertical_empty.jpg",
    pins: [],
    connections: [],
  };
  const activeCaseRef = useRef<CaseData>(activeCase);

  useEffect(() => {
    activeCaseRef.current = activeCase;
  }, [activeCase]);

  // User created pins/connections
  const [userPins, setUserPins] = useState<UserPin[]>([]);
  const [userConnections, setUserConnections] = useState<UserConnection[]>([]);
  const [, setConnectionStartId] = useState<string | null>(null);

  const userPinsRef = useRef<UserPin[]>([]);
  const userConnectionsRef = useRef<UserConnection[]>([]);

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
    setConnectionStartId(val);
    requestRenderRef.current();
  }, []);

  // ── Zoom hook ──
  const { zoomRef, panRef, resetZoom } = useBoardZoom({
    containerSizeRef,
    onZoomChange: () => {
      requestRenderRef.current();
    },
    onUpdateHoveredPin: (x, y) => {
      updateHoveredPin(x, y);
    },
  });

  // ── Pointer hook ──
  const {
    pointerRef,
    hoveredPinRef,
    draggingPinIdRef,
    connectionStartIdRef,
    updateHoveredPin,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handlePointerLeave,
  } = useBoardPointer({
    containerRef,
    boardFrameRef,
    customPinsRef,
    activeCaseRef,
    zoomRef,
    panRef,
    isEditModeRef,
    onSelectPinRef,
    onConnectPinsRef,
    onPinClickRef,
    onPinPositionChangeRef,
    updateConnectionStartId,
    onRequestRender: () => {
      requestRenderRef.current();
    },
  });

  // Re-render when props change
  useEffect(() => {
    if (requestRenderRef.current) requestRenderRef.current();
  }, [
    customPins,
    customConnections,
    selectedPinId,
    onPinClick,
    lightConeConfig,
  ]);

  // Sync external controlled case id
  const effectiveControlled = controlledCaseId ?? propCaseId;
  useEffect(() => {
    if (effectiveControlled && effectiveControlled !== internalCaseId) {
      setInternalCaseId(effectiveControlled);
      updateUserPins([]);
      updateUserConnections([]);
      updateConnectionStartId(null);
      hoveredPinRef.current = null;
    }
  }, [
    effectiveControlled,
    internalCaseId,
    updateUserPins,
    updateUserConnections,
    updateConnectionStartId,
    hoveredPinRef,
  ]);

  // ── Animation & Setup ──
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

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const devicePixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
      );

      containerSizeRef.current = { width, height };
      devicePixelRatioRef.current = devicePixelRatio;

      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      requestRenderRef.current();
    };

    const renderSceneFrame = (timestamp: number) => {
      const { width, height } = containerSizeRef.current;
      renderScene({
        context,
        canvas,
        width,
        height,
        devicePixelRatio: devicePixelRatioRef.current,
        boardImage: boardImageRef.current,
        boardFrame: boardFrameRef.current,
        currentCaseId,
        activeCase: activeCaseRef.current,
        customPins: customPinsRef.current,
        customConnections: customConnectionsRef.current,
        userPins: userPinsRef.current,
        userConnections: userConnectionsRef.current,
        selectedPinId: selectedPinIdRef.current,
        hoveredPinId: hoveredPinRef.current,
        draggingPinId: draggingPinIdRef.current,
        connectionStartId: connectionStartIdRef.current,
        pointer: pointerRef.current,
        zoom: zoomRef.current,
        pan: panRef.current,
        isEditMode: isEditModeRef.current,
        lightConeConfig: lightConeConfigRef.current,
        resolveSuspectPhotoUrl,
        getLoadedImage,
        getCompositeCard,
        timestamp,
      });
    };

    renderSceneCallbackRef.current = renderSceneFrame;

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
          ).some((p) => Boolean(p.pulseBorder));

          const shouldContinueAnimating =
            !reducedMotionRef.current &&
            (hoveredPinRef.current !== null ||
              connectionStartIdRef.current !== null ||
              hasPulsingPins);

          if (!shouldContinueAnimating || timestamp - lastRenderTime >= 33) {
            renderSceneCallbackRef.current?.(timestamp);
            lastRenderTime = timestamp;
          } else if (shouldContinueAnimating) {
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
      renderSceneCallbackRef.current = null;
      requestRenderRef.current = () => undefined;
    };
  }, [
    currentCaseId,
    resolveSuspectPhotoUrl,
    getLoadedImage,
    getCompositeCard,
    hoveredPinRef,
    draggingPinIdRef,
    connectionStartIdRef,
    pointerRef,
    zoomRef,
    panRef,
  ]);

  // Load wooden frame once on mount
  useEffect(() => {
    const frameImage = new Image();
    frameImage.src = BOARD_FRAME_SRC;
    frameImage.onload = () => {
      boardFrameRef.current = frameImage;
      requestRenderRef.current();
    };
    frameImage.onerror = () => {
      console.error(`Không thể tải ảnh khung gỗ bối cảnh: ${BOARD_FRAME_SRC}`);
    };
  }, []);

  const bgImageToUse = customBgImage ?? activeCase.bgImage;

  // Load active case background map with cancellation support
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
        aria-label="Bảng bằng chứng vụ án. Chọn các ghim để kiểm tra manh mối và lời khai."
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
        )}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* Ghim vẽ trên canvas không có trong DOM: danh sách nút ẩn cho bàn phím,
          trình đọc màn hình và kiểm thử E2E. Hiện ra khi được focus. */}
      {!isEditMode && onPinClick && customPins && customPins.length > 0 && (
        <nav
          aria-label="Danh sách ghim trên bảng điều tra"
          className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:left-2 focus-within:top-2 focus-within:z-50 focus-within:flex focus-within:max-w-xs focus-within:flex-col focus-within:gap-1 focus-within:rounded focus-within:bg-background/95 focus-within:p-2"
        >
          {customPins.map((pin) => (
            <Fragment key={pin.id}>
              <button
                type="button"
                data-pin-id={pin.id}
                data-node-kind={pin.nodeKind}
                data-subject-key={pin.subjectKey}
                onClick={(event) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  onPinClick(pin.id, pin, {
                    clientX: rect ? rect.left + rect.width / 2 : event.clientX,
                    clientY: rect ? rect.top + rect.height / 2 : event.clientY,
                  });
                }}
                className="min-h-11 rounded px-2 text-left text-sm text-foreground hover:bg-muted"
              >
                {pin.label || pin.id}
              </button>
              {pin.legacyId && pin.legacyId !== pin.id && (
                <button
                  type="button"
                  data-pin-id={pin.legacyId}
                  data-node-kind={pin.nodeKind}
                  data-subject-key={pin.subjectKey}
                  onClick={(event) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    onPinClick(pin.id, pin, {
                      clientX: rect
                        ? rect.left + rect.width / 2
                        : event.clientX,
                      clientY: rect
                        ? rect.top + rect.height / 2
                        : event.clientY,
                    });
                  }}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {pin.label || pin.legacyId}
                </button>
              )}
            </Fragment>
          ))}
        </nav>
      )}
    </div>
  );
}
