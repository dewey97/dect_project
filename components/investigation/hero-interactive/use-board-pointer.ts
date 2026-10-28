"use client";

import {
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { detectiveAudio } from "@/lib/investigation-audio";
import type {
  CaseConnection,
  CaseData,
  PinPoint,
  Point,
  ZoomState,
} from "./types";
import { BOARD_BASE_WIDTH, DRAG_THRESHOLD } from "./constants";
import {
  clamp,
  distance,
  getInnerBoardBounds,
  getPinWorldPosition,
  getViewTransform,
  isPinHit,
  screenToWorld,
} from "./utils";

export interface UseBoardPointerOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  boardFrameRef: React.RefObject<HTMLImageElement | null>;
  customPinsRef: React.MutableRefObject<PinPoint[] | undefined>;
  activeCaseRef: React.MutableRefObject<CaseData>;
  zoomRef: React.MutableRefObject<ZoomState>;
  panRef: React.MutableRefObject<Point>;
  isEditModeRef: React.MutableRefObject<boolean>;
  onSelectPinRef: React.MutableRefObject<
    ((id: string | null) => void) | undefined
  >;
  onConnectPinsRef: React.MutableRefObject<
    ((fromId: string, toId: string) => void) | undefined
  >;
  onPinClickRef: React.MutableRefObject<
    | ((
        id: string,
        pin: PinPoint,
        screenCoords: { clientX: number; clientY: number },
      ) => void)
    | undefined
  >;
  onPinPositionChangeRef: React.MutableRefObject<
    ((pinId: string, x: number, y: number) => void) | undefined
  >;
  updateConnectionStartId: (val: string | null) => void;
  onRequestRender: () => void;
  onClearTooltip?: () => void;
}

export function useBoardPointer({
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
  onRequestRender,
  onClearTooltip,
}: UseBoardPointerOptions) {
  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    active: false,
  });

  const pointerDownRef = useRef<Point>({ x: 0, y: 0 });
  const panAtPointerDownRef = useRef<Point>({ x: 0, y: 0 });
  const activePointerIdRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);

  const draggingPinIdRef = useRef<string | null>(null);
  const clickedPinIdRef = useRef<string | null>(null);
  const connectionStartIdRef = useRef<string | null>(null);
  const connectionCandidateRef = useRef(false);
  const isDraggingConnectionRef = useRef(false);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });

  // Track hovered pin by string ID (or null) to prevent magic number collisions
  const hoveredPinRef = useRef<string | null>(null);

  const updateHoveredPin = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const layoutWidth = containerRef.current.clientWidth || rect.width;
      const layoutHeight = containerRef.current.clientHeight || rect.height;
      const bounds = getInnerBoardBounds(
        layoutWidth,
        layoutHeight,
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
        onRequestRender();
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
    },
    [
      containerRef,
      boardFrameRef,
      customPinsRef,
      activeCaseRef,
      zoomRef,
      panRef,
      isEditModeRef,
      onRequestRender,
    ],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Avoid interactions bubble triggered from UI elements
      const target = event.target as HTMLElement;
      if (target.closest("[data-board-ui]")) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();

      const layoutWidth = container.clientWidth || rect.width;
      const layoutHeight = container.clientHeight || rect.height;
      const scaleX = rect.width > 0 ? layoutWidth / rect.width : 1;
      const scaleY = rect.height > 0 ? layoutHeight / rect.height : 1;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      activePointerIdRef.current = event.pointerId;
      isPointerDownRef.current = true;
      hasDraggedRef.current = false;
      draggingPinIdRef.current = null;
      clickedPinIdRef.current = null;
      connectionStartIdRef.current = null;
      connectionCandidateRef.current = false;

      pointerDownRef.current = { x, y };
      panAtPointerDownRef.current = { ...panRef.current };

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

        // Tìm pin được click: ưu tiên đầu ghim (kéo dây) rồi đến thân ghim (kéo node)
        let clickedPin: PinPoint | null = null;

        // Ưu tiên 1: đầu ghim (cho dây đỏ)
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
            clickedPin = pin;
            connectionStartIdRef.current = pin.id; // Có thể bắt đầu kéo dây
            connectionCandidateRef.current = true;
            break;
          }
        }

        // Ưu tiên 2: thân ghim (cho kéo node) nếu chưa có pin nào ở đầu ghim
        if (!clickedPin) {
          for (let index = caseSysPins.length - 1; index >= 0; index -= 1) {
            const pin = caseSysPins[index];
            const pinPosition = getPinWorldPosition(pin, bounds);
            if (isPinHit(worldPointer, pinPosition, pin, transform, bounds)) {
              clickedPin = pin;
              draggingPinIdRef.current = pin.id; // Có thể bắt đầu kéo node
              dragOffsetRef.current = {
                x: worldPointer.x - pinPosition.x,
                y: worldPointer.y - pinPosition.y,
              };
              break;
            }
          }
        }

        if (clickedPin) {
          clickedPinIdRef.current = clickedPin.id; // Lưu pin được click để dùng trong finishPointerInteraction
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {}
          onRequestRender();
          try {
            event.preventDefault();
            event.stopPropagation();
          } catch {}
          return;
        }
      }

      updateHoveredPin(x, y);
    },
    [
      containerRef,
      boardFrameRef,
      customPinsRef,
      activeCaseRef,
      zoomRef,
      panRef,
      isEditModeRef,
      updateHoveredPin,
      onRequestRender,
    ],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();

      const layoutWidth = container.clientWidth || rect.width;
      const layoutHeight = container.clientHeight || rect.height;
      const scaleX = rect.width > 0 ? layoutWidth / rect.width : 1;
      const scaleY = rect.height > 0 ? layoutHeight / rect.height : 1;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

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
        const deltaX = x - pointerDownRef.current.x;
        const deltaY = y - pointerDownRef.current.y;
        const dragDistance = Math.hypot(deltaX, deltaY);

        // Chỉ khi di chuyển vượt ngưỡng mới tính là kéo thực sự và cập nhật vị trí
        if (dragDistance > DRAG_THRESHOLD) {
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
          onRequestRender();
          try {
            event.preventDefault();
            event.stopPropagation();
          } catch {}
          return;
        }
      } else if (
        isPointerDownRef.current &&
        isActivePointer &&
        !draggingPinIdRef.current &&
        !isDraggingConnectionRef.current
      ) {
        const deltaX = x - pointerDownRef.current.x;
        const deltaY = y - pointerDownRef.current.y;
        const dragDistance = Math.hypot(deltaX, deltaY);

        if (dragDistance > DRAG_THRESHOLD) {
          hasDraggedRef.current = true;
        }

        // Khóa cố định bảng 100% - Không cho phép pan nền
        panRef.current = { x: 0, y: 0 };
      }

      updateHoveredPin(x, y);
      onRequestRender();
    },
    [
      containerRef,
      boardFrameRef,
      zoomRef,
      panRef,
      isEditModeRef,
      onPinPositionChangeRef,
      updateConnectionStartId,
      updateHoveredPin,
      onRequestRender,
    ],
  );

  const finishPointerInteraction = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, allowInteraction: boolean) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-board-ui]")) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        draggingPinIdRef.current = null;
        clickedPinIdRef.current = null;
        return;
      }

      const container = containerRef.current;
      if (!container) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        draggingPinIdRef.current = null;
        clickedPinIdRef.current = null;
        return;
      }
      const rect = container.getBoundingClientRect();

      const layoutWidth = container.clientWidth || rect.width;
      const layoutHeight = container.clientHeight || rect.height;
      const scaleX = rect.width > 0 ? layoutWidth / rect.width : 1;
      const scaleY = rect.height > 0 ? layoutHeight / rect.height : 1;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

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

      const initialClickedPinId = clickedPinIdRef.current;
      clickedPinIdRef.current = null;

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

        onRequestRender();
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

        // Nếu lúc pointerdown đã nhận diện trúng pin, dùng lại pin đó
        if (initialClickedPinId) {
          bestHitPin =
            caseSysPins.find((p) => p.id === initialClickedPinId) || null;
        }

        // Nếu chưa có, check tất cả system/custom pins in reverse order
        if (!bestHitPin) {
          for (let index = caseSysPins.length - 1; index >= 0; index -= 1) {
            const pin = caseSysPins[index];
            const pinPosition = getPinWorldPosition(pin, bounds);

            if (isPinHit(worldPointer, pinPosition, pin, transform, bounds)) {
              bestHitPin = pin;
              break;
            }
          }
        }

        if (bestHitPin) {
          if (isEditModeRef.current) {
            if (onSelectPinRef.current) {
              onSelectPinRef.current(bestHitPin.id);
            }
          } else if (onPinClickRef.current) {
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

      onRequestRender();
    },
    [
      containerRef,
      boardFrameRef,
      customPinsRef,
      activeCaseRef,
      zoomRef,
      panRef,
      isEditModeRef,
      onConnectPinsRef,
      onSelectPinRef,
      onPinClickRef,
      updateConnectionStartId,
      updateHoveredPin,
      onRequestRender,
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
    if (onClearTooltip) {
      onClearTooltip();
    }
    onRequestRender();
  }, [onRequestRender, onClearTooltip]);

  return {
    pointerRef,
    hoveredPinRef,
    draggingPinIdRef,
    isDraggingConnectionRef,
    connectionStartIdRef,
    updateHoveredPin,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handlePointerLeave,
  };
}
