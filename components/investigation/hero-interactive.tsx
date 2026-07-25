"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────

interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface ZoomState {
  active: boolean;
  originX: number;
  originY: number;
}

interface ViewTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

interface BoardBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PinPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
}

interface CaseConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
}

type BoardMode = "zoom" | "pin";

interface UserPin {
  id: string;
  x: number; // Ratio 0-1 relative to case inner board bounds
  y: number;
  label: string;
}

interface UserConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
}

interface CaseData {
  id: string;
  title: string;
  description: string;
  status: "active" | "solved" | "locked";
  bgImage: string; // Cases maps
  pins: PinPoint[];
  connections: CaseConnection[];
}

// ────────────────────────────────────────
// Constants & Case Data
// ────────────────────────────────────────

const BOARD_FRAME_SRC = "/evidence-board-frame.png";

const CASES_LIST: CaseData[] = [
  {
    id: "case-01",
    title: "VẬN ĐƠN BẤT THƯỜNG",
    description: "Vụ mất tích bí ẩn tại Cầu cảng số 9",
    status: "active",
    bgImage: "/evidence-board-bg.png",
    pins: [
      {
        id: "c1-pin-0",
        x: 0.22,
        y: 0.24,
        label: "NẠN NHÂN",
        detail: "Nạn nhân chính của vụ án",
      },
      {
        id: "c1-pin-1",
        x: 0.5,
        y: 0.18,
        label: "VẬN ĐƠN",
        detail: "Container #7722 — Trọng tải bất thường 24.5T",
      },
      {
        id: "c1-pin-2",
        x: 0.78,
        y: 0.26,
        label: "TANG VẬT",
        detail: "Ứng dụng nhắn tin lưu payload mã hóa AES-256",
      },
      {
        id: "c1-pin-3",
        x: 0.5,
        y: 0.5,
        label: "HIỆN TRƯỜNG",
        detail: "Cầu cảng #9 — Camera mất tín hiệu 15 phút",
      },
      {
        id: "c1-pin-4",
        x: 0.18,
        y: 0.74,
        label: "CHÌA KHÓA",
        detail: "Chìa khóa đồng — mã số chìm: NX-4471",
      },
      {
        id: "c1-pin-5",
        x: 0.78,
        y: 0.72,
        label: "NGHI PHẠM",
        detail: "[DỮ LIỆU BỊ KHÓA — CẦN MÃ KÍCH HOẠT]",
      },
      {
        id: "c1-pin-6",
        x: 0.36,
        y: 0.78,
        label: "SỔ TAY",
        detail: "Ghi chép hàng hóa — phát hiện 02:14 AM",
      },
      {
        id: "c1-pin-7",
        x: 0.64,
        y: 0.38,
        label: "BẢN ĐỒ",
        detail: "Phân khu bến tàu 12 — lối thoát hiểm B",
      },
    ],
    connections: [
      { id: "c1-conn-0", fromPinId: "c1-pin-0", toPinId: "c1-pin-3" },
      { id: "c1-conn-1", fromPinId: "c1-pin-1", toPinId: "c1-pin-3" },
      { id: "c1-conn-2", fromPinId: "c1-pin-2", toPinId: "c1-pin-3" },
      { id: "c1-conn-3", fromPinId: "c1-pin-3", toPinId: "c1-pin-4" },
      { id: "c1-conn-4", fromPinId: "c1-pin-3", toPinId: "c1-pin-5" },
      { id: "c1-conn-5", fromPinId: "c1-pin-0", toPinId: "c1-pin-5" },
      { id: "c1-conn-6", fromPinId: "c1-pin-2", toPinId: "c1-pin-5" },
      { id: "c1-conn-7", fromPinId: "c1-pin-1", toPinId: "c1-pin-7" },
      { id: "c1-conn-8", fromPinId: "c1-pin-4", toPinId: "c1-pin-6" },
      { id: "c1-conn-9", fromPinId: "c1-pin-0", toPinId: "c1-pin-6" },
      { id: "c1-conn-10", fromPinId: "c1-pin-7", toPinId: "c1-pin-3" },
    ],
  },
  {
    id: "case-02",
    title: "BÓNG MA PHÒNG THÍ NGHIỆM",
    description:
      "Rò rỉ dữ liệu sinh học đột biến tại tổ hợp phân tích bio-tech",
    status: "active",
    bgImage: "/evidence-board-bg.png",
    pins: [
      {
        id: "c2-pin-0",
        x: 0.25,
        y: 0.3,
        label: "BẢN THIẾT KẾ",
        detail: "Sơ đồ phòng Lab Bio-Safety Cấp 4",
      },
      {
        id: "c2-pin-1",
        x: 0.55,
        y: 0.2,
        label: "MẪU THỬ",
        detail: "Ống nghiệm vỡ chứa hợp chất Fluoro-green",
      },
      {
        id: "c2-pin-2",
        x: 0.75,
        y: 0.35,
        label: "MÁY PHÂN TÍCH",
        detail: "Hệ thống sắc ký khí ghi nhận sự biến dạng chuỗi",
      },
      {
        id: "c2-pin-3",
        x: 0.45,
        y: 0.6,
        label: "NHẬT KÝ CA",
        detail: "Tiến sĩ K. Vy biến mất bất thường lúc 03:00 AM",
      },
      {
        id: "c2-pin-4",
        x: 0.8,
        y: 0.75,
        label: "BỒN CHỨA",
        detail: "Hệ thống thông gió bị tắt thủ công từ phòng máy chủ",
      },
    ],
    connections: [
      { id: "c2-conn-0", fromPinId: "c2-pin-0", toPinId: "c2-pin-3" },
      { id: "c2-conn-1", fromPinId: "c2-pin-1", toPinId: "c2-pin-3" },
      { id: "c2-conn-2", fromPinId: "c2-pin-2", toPinId: "c2-pin-3" },
      { id: "c2-conn-3", fromPinId: "c2-pin-3", toPinId: "c2-pin-4" },
    ],
  },
  {
    id: "case-03",
    title: "DẤU VẾT KỸ THUẬT SỐ",
    description:
      "Vụ tấn công ransomware mã hóa toàn bộ dữ liệu máy chủ tài chính",
    status: "active",
    bgImage: "/evidence-board-bg.png",
    pins: [
      {
        id: "c3-pin-0",
        x: 0.2,
        y: 0.2,
        label: "CỔNG VÀO",
        detail: "VPN Gateway bị dò thông tin xác thực từ 3 IP lạ",
      },
      {
        id: "c3-pin-1",
        x: 0.5,
        y: 0.25,
        label: "MÃ ĐỘC",
        detail: "Biến thể WannaDie v3.1 tìm thấy trong bộ nhớ RAM",
      },
      {
        id: "c3-pin-2",
        x: 0.8,
        y: 0.3,
        label: "VÍ ĐIỆN TỬ",
        detail: "Địa chỉ nhận tiền chuộc: 3AbCd...9FqP",
      },
      {
        id: "c3-pin-3",
        x: 0.5,
        y: 0.65,
        label: "MÁY CHỦ SỞ ĐỒNG",
        detail: "Cơ sở dữ liệu giao dịch bị đổi đuôi sang .locked",
      },
    ],
    connections: [
      { id: "c3-conn-0", fromPinId: "c3-pin-0", toPinId: "c3-pin-1" },
      { id: "c3-conn-1", fromPinId: "c3-pin-1", toPinId: "c3-pin-3" },
      { id: "c3-conn-2", fromPinId: "c3-pin-2", toPinId: "c3-pin-3" },
    ],
  },
];

const ZOOM_SCALE = 2.2;
const MAX_DEVICE_PIXEL_RATIO = 2;

// Precise inner bounds of the transparent region in evidence-board-frame.png
// (ratios 0-1 relative to the frame image dimensions, derived from alpha-channel analysis)
const FRAME_INNER_LEFT = 0.3879;
const FRAME_INNER_TOP = 0.2079;
const FRAME_INNER_WIDTH = 0.5284;
const FRAME_INNER_HEIGHT = 0.5461;

const PIN_HIT_RADIUS = 24;
const PIN_GLOW_RADIUS = 40;

const FLASHLIGHT_RADIUS = 140;
const CENTER_LIGHT_RADIUS_RATIO = 0.35;

const DRAG_THRESHOLD = 5;
const MAX_PAN_RATIO = 0.45;
const PIN_COLORS = [
  { base: "#cc2222", highlight: "#ff6666" },
  { base: "#2255cc", highlight: "#6699ff" },
  { base: "#cc2222", highlight: "#ff6666" },
  { base: "#ccaa22", highlight: "#ffdd66" },
  { base: "#2255cc", highlight: "#6699ff" },
  { base: "#cc2222", highlight: "#ff6666" },
  { base: "#22aa44", highlight: "#66dd88" },
  { base: "#ccaa22", highlight: "#ffdd66" },
];

// ────────────────────────────────────────
// Utility functions
// ────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Calculate the board bounds (the inner transparent region of the frame)
 * in screen-space coordinates. This must be used consistently by both
 * the render loop and the pointer event handlers.
 */
function getInnerBoardBounds(
  containerWidth: number,
  containerHeight: number,
  frameImg: HTMLImageElement | null,
): BoardBounds {
  let frameDx = 0,
    frameDy = 0,
    frameDw = containerWidth,
    frameDh = containerHeight;

  if (frameImg && frameImg.width > 0 && frameImg.height > 0) {
    const frameAspect = frameImg.width / frameImg.height;
    const canvasAspect = containerWidth / containerHeight;
    if (canvasAspect > frameAspect) {
      frameDw = containerWidth;
      frameDh = containerWidth / frameAspect;
      frameDx = 0;
      frameDy = (containerHeight - frameDh) / 2;
    } else {
      frameDh = containerHeight;
      frameDw = containerHeight * frameAspect;
      frameDx = (containerWidth - frameDw) / 2;
      frameDy = 0;
    }
  }

  return {
    x: frameDx + FRAME_INNER_LEFT * frameDw,
    y: frameDy + FRAME_INNER_TOP * frameDh,
    width: FRAME_INNER_WIDTH * frameDw,
    height: FRAME_INNER_HEIGHT * frameDh,
  };
}

function getViewTransform(zoom: ZoomState, pan: Point): ViewTransform {
  if (!zoom.active) {
    return {
      scale: 1,
      translateX: 0,
      translateY: 0,
    };
  }

  /*
   * Công thức này giữ vị trí người dùng nhấp tại cùng một điểm
   * trên màn hình sau khi phóng to:
   *
   * screenX = worldX * scale + translateX
   * translateX = originX * (1 - scale)
   */
  return {
    scale: ZOOM_SCALE,
    translateX: zoom.originX * (1 - ZOOM_SCALE) + pan.x,
    translateY: zoom.originY * (1 - ZOOM_SCALE) + pan.y,
  };
}

function worldToScreen(worldPoint: Point, transform: ViewTransform): Point {
  return {
    x: worldPoint.x * transform.scale + transform.translateX,
    y: worldPoint.y * transform.scale + transform.translateY,
  };
}

function screenToWorld(screenPoint: Point, transform: ViewTransform): Point {
  return {
    x: (screenPoint.x - transform.translateX) / transform.scale,
    y: (screenPoint.y - transform.translateY) / transform.scale,
  };
}

function getPinWorldPosition(pin: PinPoint, bounds: BoardBounds): Point {
  return {
    x: bounds.x + pin.x * bounds.width,
    y: bounds.y + pin.y * bounds.height,
  };
}

// ────────────────────────────────────────
// Component
// ────────────────────────────────────────

interface TooltipState {
  pinIndex: number;
  isUserPin: boolean;
  x: number;
  y: number;
}

export function HeroInteractive({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const boardImageRef = useRef<HTMLImageElement | null>(null);
  const boardFrameRef = useRef<HTMLImageElement | null>(null);

  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskContextRef = useRef<CanvasRenderingContext2D | null>(null);

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
  const [currentCaseId, setCurrentCaseId] = useState<string>("case-01");
  const [boardMode, setBoardMode] = useState<BoardMode>("zoom");

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
    const { width, height } = containerSizeRef.current;

    if (width <= 0 || height <= 0) {
      return;
    }

    const bounds = getInnerBoardBounds(width, height, boardFrameRef.current);

    const transform = getViewTransform(zoomRef.current, panRef.current);

    const worldPointer = screenToWorld(
      {
        x: screenX,
        y: screenY,
      },
      transform,
    );

    const worldHitRadius = PIN_HIT_RADIUS / transform.scale;

    let foundPinIndex: number | null = null;
    let foundIsUserPin = false;
    let foundPinId: string | null = null;

    // 1. Check system pins first
    const sysPins = activeCaseRef.current.pins;
    for (let index = 0; index < sysPins.length; index += 1) {
      const pinPosition = getPinWorldPosition(sysPins[index], bounds);

      if (
        distance(
          worldPointer.x,
          worldPointer.y,
          pinPosition.x,
          pinPosition.y,
        ) <= worldHitRadius
      ) {
        foundPinIndex = index;
        foundIsUserPin = false;
        foundPinId = sysPins[index].id;
        break;
      }
    }

    // 2. If not found, check user pins
    if (foundPinIndex === null) {
      const uPins = userPinsRef.current;
      for (let index = 0; index < uPins.length; index += 1) {
        const pinPosition = {
          x: bounds.x + uPins[index].x * bounds.width,
          y: bounds.y + uPins[index].y * bounds.height,
        };

        if (
          distance(
            worldPointer.x,
            worldPointer.y,
            pinPosition.x,
            pinPosition.y,
          ) <= worldHitRadius
        ) {
          foundPinIndex = index;
          foundIsUserPin = true;
          foundPinId = uPins[index].id;
          break;
        }
      }
    }

    if (hoveredPinRef.current !== foundPinId) {
      hoveredPinRef.current = foundPinId;
    }

    if (foundPinIndex === null || foundPinId === null) {
      setTooltip(null);
      requestRenderRef.current();
      return;
    }

    const pinWorldPosition = foundIsUserPin
      ? {
          x: bounds.x + userPinsRef.current[foundPinIndex].x * bounds.width,
          y: bounds.y + userPinsRef.current[foundPinIndex].y * bounds.height,
        }
      : getPinWorldPosition(activeCaseRef.current.pins[foundPinIndex], bounds);

    const pinScreenPosition = worldToScreen(pinWorldPosition, transform);

    setTooltip((current) => {
      if (
        current?.pinIndex === foundPinIndex &&
        current?.isUserPin === foundIsUserPin &&
        Math.abs(current.x - pinScreenPosition.x) < 0.5 &&
        Math.abs(current.y - pinScreenPosition.y) < 0.5
      ) {
        return current;
      }

      return {
        pinIndex: foundPinIndex,
        isUserPin: foundIsUserPin,
        x: pinScreenPosition.x,
        y: pinScreenPosition.y,
      };
    });

    requestRenderRef.current();
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

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Avoid interactions bubble triggered from UI elements
      const target = event.target as HTMLElement;
      if (target.closest("[data-board-ui]")) {
        return;
      }

      if (
        activePointerIdRef.current !== null &&
        activePointerIdRef.current !== event.pointerId
      ) {
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

      event.currentTarget.setPointerCapture(event.pointerId);

      updateHoveredPin(x, y);
    },
    [updateHoveredPin],
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

      const isActivePointer = activePointerIdRef.current === event.pointerId;

      if (
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
        return;
      }

      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      isPointerDownRef.current = false;
      activePointerIdRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      // Check if user actually dragged/panned
      const isDrag = hasDraggedRef.current;

      if (allowInteraction && !isDrag) {
        const bounds = getInnerBoardBounds(
          rect.width,
          rect.height,
          boardFrameRef.current,
        );

        const transform = getViewTransform(zoomRef.current, panRef.current);

        const worldPointer = screenToWorld({ x, y }, transform);

        if (boardMode === "zoom") {
          toggleZoomAt(x, y);
        } else if (boardMode === "pin") {
          const worldHitRadius = PIN_HIT_RADIUS / transform.scale;



          // 2. Identify if clicked on any ghim (system or user)
          let clickedPinIndex: number | null = null;
          let clickedIsUserPin = false;

          // Check system pins first
          const caseSysPins = activeCaseRef.current.pins;
          for (let index = 0; index < caseSysPins.length; index += 1) {
            const pinPosition = getPinWorldPosition(caseSysPins[index], bounds);

            if (
              distance(
                worldPointer.x,
                worldPointer.y,
                pinPosition.x,
                pinPosition.y,
              ) <= worldHitRadius
            ) {
              clickedPinIndex = index;
              clickedIsUserPin = false;
              break;
            }
          }

          // Check user pins
          if (clickedPinIndex === null) {
            const uPins = userPinsRef.current;
            for (let index = 0; index < uPins.length; index += 1) {
              const pinPosition = {
                x: bounds.x + uPins[index].x * bounds.width,
                y: bounds.y + uPins[index].y * bounds.height,
              };

              if (
                distance(
                  worldPointer.x,
                  worldPointer.y,
                  pinPosition.x,
                  pinPosition.y,
                ) <= worldHitRadius
              ) {
                clickedPinIndex = index;
                clickedIsUserPin = true;
                break;
              }
            }
          }

          const hasClickedPin = clickedPinIndex !== null;

          if (hasClickedPin && clickedPinIndex !== null) {
            // Clicked a pin
            const clickedPinId = clickedIsUserPin
              ? userPinsRef.current[clickedPinIndex].id
              : activeCaseRef.current.pins[clickedPinIndex].id;

            if (connectionStartIdRef.current === null) {
              // Click ghim A -> Chọn ghim A làm nguồn nối dây
              updateConnectionStartId(clickedPinId);
            } else {
              const activeConnStart = connectionStartIdRef.current;
              if (activeConnStart === clickedPinId) {
                // Click lại ghim A → nếu là ghim user thì xóa, system thì bỏ chọn
                if (clickedIsUserPin) {
                  updateUserPins((prev) =>
                    prev.filter((p) => p.id !== clickedPinId),
                  );
                  updateUserConnections((prev) =>
                    prev.filter(
                      (c) =>
                        c.fromPinId !== clickedPinId &&
                        c.toPinId !== clickedPinId,
                    ),
                  );
                  hoveredPinRef.current = null;
                  setTooltip(null);
                }
                updateConnectionStartId(null);
              } else {
                // Click ghim B -> Nối/tháo dây A—B
                const alreadyConnected = userConnectionsRef.current.some(
                  (c) =>
                    (c.fromPinId === activeConnStart &&
                      c.toPinId === clickedPinId) ||
                    (c.fromPinId === clickedPinId &&
                      c.toPinId === activeConnStart),
                );

                if (alreadyConnected) {
                  // Tháo dây
                  updateUserConnections((prev) =>
                    prev.filter(
                      (c) =>
                        !(
                          (c.fromPinId === activeConnStart &&
                            c.toPinId === clickedPinId) ||
                          (c.fromPinId === clickedPinId &&
                            c.toPinId === activeConnStart)
                        ),
                    ),
                  );
                } else {
                  // Tạo dây
                  const newConn: UserConnection = {
                    id: crypto.randomUUID(),
                    fromPinId: activeConnStart,
                    toPinId: clickedPinId,
                  };
                  updateUserConnections((prev) => [...prev, newConn]);
                }
                updateConnectionStartId(null);
              }
            }
          } else {
            // Clicked empty background
            if (connectionStartIdRef.current !== null) {
              // Nếu đang chọn ghim A: click vùng trống -> Bỏ chọn, không tạo ghim mới
              updateConnectionStartId(null);
            } else {
              // Nếu không chọn ghim nào: click vùng trống -> thêm ghim mới
              const imageX = (worldPointer.x - bounds.x) / bounds.width;
              const imageY = (worldPointer.y - bounds.y) / bounds.height;

              if (imageX >= 0 && imageX <= 1 && imageY >= 0 && imageY <= 1) {
                // Check minimum distance
                let isTooClose = false;
                const checkRadius = PIN_HIT_RADIUS / transform.scale;

                // Check against system pins
                for (let i = 0; i < caseSysPins.length; i++) {
                  const sysPos = getPinWorldPosition(caseSysPins[i], bounds);
                  if (
                    distance(
                      worldPointer.x,
                      worldPointer.y,
                      sysPos.x,
                      sysPos.y,
                    ) < checkRadius
                  ) {
                    isTooClose = true;
                    break;
                  }
                }

                // Check against user pins
                if (!isTooClose) {
                  const uPins = userPinsRef.current;
                  for (let i = 0; i < uPins.length; i++) {
                    const userPos = {
                      x: bounds.x + uPins[i].x * bounds.width,
                      y: bounds.y + uPins[i].y * bounds.height,
                    };
                    if (
                      distance(
                        worldPointer.x,
                        worldPointer.y,
                        userPos.x,
                        userPos.y,
                      ) < checkRadius
                    ) {
                      isTooClose = true;
                      break;
                    }
                  }
                }

                if (!isTooClose) {
                  const pinNumber = nextUserPinNumberRef.current;
                  nextUserPinNumberRef.current += 1;
                  const newPinLabel = `GHIM ${pinNumber.toString().padStart(2, "0")}`;
                  const newPin: UserPin = {
                    id: crypto.randomUUID(),
                    x: imageX,
                    y: imageY,
                    label: newPinLabel,
                  };
                  updateUserPins((prev) => [...prev, newPin]);
                }
              }
            }
          }
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
      // 1. Draw the wooden frame in screen space (unaffected by zoom/pan)
      // Uses "cover" fit — aspect ratio preserved, no stretching
      // ──────────────────────────────────
      context.save();
      if (frameImg) {
        context.drawImage(
          frameImg,
          0,
          0,
          frameImg.width,
          frameImg.height,
          frameDx,
          frameDy,
          frameDw,
          frameDh,
        );
      } else {
        // Fallback wooden border CSS style representation
        context.strokeStyle = "#1c120c";
        context.lineWidth = Math.min(width * 0.05, height * 0.05) * 2;
        context.strokeRect(0, 0, width, height);
      }
      context.restore();

      // ──────────────────────────────────
      // 2. Draw transformed board scene (Inner Map content)
      // ──────────────────────────────────

      context.save();

      // Apply zoom & pan transform ONLY for the inner map contents
      context.translate(transform.translateX, transform.translateY);
      context.scale(transform.scale, transform.scale);

      // 2.1 Draw case evidence map inside the inner bounds
      if (image) {
        context.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
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
      const casePins = activeCaseRef.current.pins;
      const uPins = userPinsRef.current;
      const allPinsUnified = [
        ...casePins.map((p) => ({
          id: p.id,
          x: p.x,
          y: p.y,
          label: p.label,
          isUser: false,
        })),
        ...uPins.map((p) => ({
          id: p.id,
          x: p.x,
          y: p.y,
          label: p.label,
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
      // 2. Draw evidence strings (system)
      // ──────────────────────────────────

      const caseConns = activeCaseRef.current.connections;
      caseConns.forEach((conn) => {
        const start = pinPositionsMap.get(conn.fromPinId);
        const end = pinPositionsMap.get(conn.toPinId);
        if (!start || !end) return;

        const middleX = (start.x + end.x) / 2;
        const middleY = (start.y + end.y) / 2 + 12;

        context.save();
        context.strokeStyle = "rgba(200, 35, 35, 0.7)";
        context.lineWidth = 1.5 / transform.scale;
        context.shadowColor = "rgba(200, 35, 35, 0.25)";
        context.shadowBlur = 3 / transform.scale;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(middleX, middleY, end.x, end.y);
        context.stroke();
        context.restore();

        context.save();
        context.strokeStyle = "rgba(200, 35, 35, 0.08)";
        context.lineWidth = 5 / transform.scale;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(middleX, middleY, end.x, end.y);
        context.stroke();
        context.restore();
      });

      // ──────────────────────────────────
      // 2.1. Draw user custom connections
      // ──────────────────────────────────
      const uConns = userConnectionsRef.current;
      uConns.forEach((conn) => {
        const start = pinPositionsMap.get(conn.fromPinId);
        const end = pinPositionsMap.get(conn.toPinId);
        if (!start || !end) return;

        // User strings sag slightly more or less depending on distance
        const middleX = (start.x + end.x) / 2;
        const middleY = (start.y + end.y) / 2 + 15;

        // Draw custom user connection (slightly different color or style, e.g. bright crimson)
        context.save();
        context.strokeStyle = "rgba(235, 50, 50, 0.85)";
        context.lineWidth = 1.5 / transform.scale;
        context.shadowColor = "rgba(235, 50, 50, 0.4)";
        context.shadowBlur = 4 / transform.scale;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(middleX, middleY, end.x, end.y);
        context.stroke();
        context.restore();

        context.save();
        context.strokeStyle = "rgba(235, 50, 50, 0.12)";
        context.lineWidth = 6 / transform.scale;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(middleX, middleY, end.x, end.y);
        context.stroke();
        context.restore();
      });

      // ──────────────────────────────────
      // 2.2. Draw active connector wire
      // ──────────────────────────────────
      if (connectionStartIdRef.current && pointer.active) {
        const start = pinPositionsMap.get(connectionStartIdRef.current);
        if (start) {
          const pointerWorld = screenToWorld(
            { x: pointer.x, y: pointer.y },
            transform,
          );
          context.save();
          context.strokeStyle = "rgba(255, 235, 80, 0.65)"; // gold dashed line for active connection
          context.lineWidth = 1.5 / transform.scale;
          context.setLineDash([4 / transform.scale, 4 / transform.scale]);
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(pointerWorld.x, pointerWorld.y);
          context.stroke();
          context.restore();
        }
      }

      // ──────────────────────────────────
      // 3. Draw push pins (system & user)
      // ──────────────────────────────────
      allPinsUnified.forEach((pin) => {
        const pinPosition = pinPositionsMap.get(pin.id);
        if (!pinPosition) return;

        const distanceToPointer = pointer.active
          ? distance(
              worldPointer.x,
              worldPointer.y,
              pinPosition.x,
              pinPosition.y,
            )
          : Number.POSITIVE_INFINITY;

        const worldGlowRadius = PIN_GLOW_RADIUS / transform.scale;
        const isNear = distanceToPointer < worldGlowRadius;
        const intensity = isNear ? 1 - distanceToPointer / worldGlowRadius : 0;

        const baseRadius = (isNear ? 7 : 5.5) / transform.scale;

        // Check if this pin is currently hovered by checking if pin.id matches hoveredPinRef
        const isCurrentlyHovered =
          hoveredPinRef.current !== null && hoveredPinRef.current === pin.id;

        // Determine pin base/highlight colors
        let color = PIN_COLORS[allPinsUnified.indexOf(pin) % PIN_COLORS.length];
        if (pin.isUser) {
          // Default user pin color: orange/golden copper
          color = { base: "#cc2222", highlight: "#ff4444" };
        }

        // Active connection indicator ring
        const isActiveConnStart = connectionStartIdRef.current === pin.id;

        // Pin shadow
        context.save();
        context.fillStyle = "rgba(0,0,0,0.35)";
        context.beginPath();
        context.ellipse(
          pinPosition.x + 2 / transform.scale,
          pinPosition.y + 3 / transform.scale,
          5.5 / transform.scale,
          3.5 / transform.scale,
          0,
          0,
          Math.PI * 2,
        );
        context.fill();
        context.restore();

        // Pin dome
        context.save();
        const pinGradient = context.createRadialGradient(
          pinPosition.x - baseRadius * 0.3,
          pinPosition.y - baseRadius * 0.3,
          0,
          pinPosition.x,
          pinPosition.y,
          baseRadius,
        );
        pinGradient.addColorStop(0, color.highlight);
        pinGradient.addColorStop(0.7, color.base);
        pinGradient.addColorStop(1, "rgba(0,0,0,0.3)");
        context.fillStyle = pinGradient;
        context.beginPath();
        context.arc(pinPosition.x, pinPosition.y, baseRadius, 0, Math.PI * 2);
        context.fill();

        // Specular highlight
        context.fillStyle = "rgba(255,255,255,0.4)";
        context.beginPath();
        context.ellipse(
          pinPosition.x - baseRadius * 0.25,
          pinPosition.y - baseRadius * 0.25,
          baseRadius * 0.32,
          baseRadius * 0.22,
          -Math.PI / 4,
          0,
          Math.PI * 2,
        );
        context.fill();
        context.restore();

        // Glow ring or Active selection ring
        if (isNear || isActiveConnStart) {
          const motionPulse = reducedMotionRef.current
            ? 0
            : Math.sin(timestamp * 0.004) * 0.12;

          const ringRadius = baseRadius + (7 + intensity * 4) / transform.scale;

          context.save();
          if (isActiveConnStart) {
            context.strokeStyle = `rgba(255, 235, 80, ${0.7 + Math.sin(timestamp * 0.008) * 0.15})`; // pulsed gold ring
            context.lineWidth = 2.0 / transform.scale;
          } else {
            context.strokeStyle = `rgba(255,255,200,${0.25 + motionPulse})`;
            context.lineWidth = 1.5 / transform.scale;
          }
          context.setLineDash([3 / transform.scale, 3 / transform.scale]);
          context.lineDashOffset = reducedMotionRef.current
            ? 0
            : (-timestamp * 0.02) / transform.scale;

          context.beginPath();
          context.arc(pinPosition.x, pinPosition.y, ringRadius, 0, Math.PI * 2);
          context.stroke();
          context.restore();
        }


      });

      context.restore();

      // ──────────────────────────────────
      // 4. Draw dark mask in screen space
      // ──────────────────────────────────

      if (maskContext) {
        maskContext.setTransform(1, 0, 0, 1, 0, 0);

        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

        maskContext.setTransform(
          devicePixelRatio,
          0,
          0,
          devicePixelRatio,
          0,
          0,
        );

        maskContext.save();

        maskContext.globalCompositeOperation = "source-over";

        maskContext.fillStyle = "rgba(0, 0, 0, 0.70)";

        maskContext.fillRect(0, 0, width, height);

        maskContext.globalCompositeOperation = "destination-out";

        const boardCenterWorld = {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2,
        };

        const boardCenterScreen = worldToScreen(boardCenterWorld, transform);

        const centerRadius =
          Math.min(width, height) * CENTER_LIGHT_RADIUS_RATIO;

        const centerGradient = maskContext.createRadialGradient(
          boardCenterScreen.x,
          boardCenterScreen.y,
          0,
          boardCenterScreen.x,
          boardCenterScreen.y,
          centerRadius,
        );

        centerGradient.addColorStop(0, "rgba(0, 0, 0, 0.55)");

        centerGradient.addColorStop(0.6, "rgba(0, 0, 0, 0.35)");

        centerGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        maskContext.fillStyle = centerGradient;

        maskContext.beginPath();

        maskContext.arc(
          boardCenterScreen.x,
          boardCenterScreen.y,
          centerRadius,
          0,
          Math.PI * 2,
        );

        maskContext.fill();

        if (pointer.active) {
          const flashlightGradient = maskContext.createRadialGradient(
            pointer.x,
            pointer.y,
            0,
            pointer.x,
            pointer.y,
            FLASHLIGHT_RADIUS,
          );

          flashlightGradient.addColorStop(0, "rgba(0, 0, 0, 0.75)");

          flashlightGradient.addColorStop(0.6, "rgba(0, 0, 0, 0.45)");

          flashlightGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          maskContext.fillStyle = flashlightGradient;

          maskContext.beginPath();

          maskContext.arc(
            pointer.x,
            pointer.y,
            FLASHLIGHT_RADIUS,
            0,
            Math.PI * 2,
          );

          maskContext.fill();
        }

        maskContext.restore();

        context.drawImage(
          maskCanvas,
          0,
          0,
          maskCanvas.width,
          maskCanvas.height,
          0,
          0,
          width,
          height,
        );
      }

      // ──────────────────────────────────
      // 5. Flashlight glow
      // ──────────────────────────────────

      if (pointer.active) {
        context.save();

        context.globalCompositeOperation = "screen";

        const glowGradient = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          FLASHLIGHT_RADIUS,
        );

        glowGradient.addColorStop(0, "rgba(255, 245, 225, 0.08)");

        glowGradient.addColorStop(0.6, "rgba(255, 245, 225, 0.02)");

        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        context.fillStyle = glowGradient;

        context.beginPath();

        context.arc(pointer.x, pointer.y, FLASHLIGHT_RADIUS, 0, Math.PI * 2);

        context.fill();
        context.restore();
      }

      // ──────────────────────────────────
      // 6. Screen vignette
      // ──────────────────────────────────

      context.save();

      const vignette = context.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.25,
        width / 2,
        height / 2,
        width * 0.75,
      );

      vignette.addColorStop(0, "transparent");

      vignette.addColorStop(1, "rgba(0, 0, 0, 0.45)");

      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);

      context.restore();
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

          const shouldContinueAnimating =
            !reducedMotionRef.current &&
            (hoveredPinRef.current !== null ||
              connectionStartIdRef.current !== null);

          if (timestamp - lastRenderTime >= 33) {
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

  // Effect 3: Load active case background map with cancellation support to avoid race conditions
  useEffect(() => {
    let cancelled = false;

    boardImageRef.current = null;
    requestRenderRef.current();

    const boardImage = new Image();
    boardImage.src = activeCase.bgImage;
    boardImage.onload = () => {
      if (cancelled) return;
      boardImageRef.current = boardImage;
      requestRenderRef.current();
    };
    boardImage.onerror = () => {
      if (cancelled) return;
      console.error(`Không thể tải ảnh bản đồ vụ án: ${activeCase.bgImage}`);
      boardImageRef.current = null;
      requestRenderRef.current();
    };

    return () => {
      cancelled = true;
    };
  }, [activeCase.bgImage]);

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
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-[#0a0705]",
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
          "cursor-crosshair select-none touch-none",
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

        {/* Floating toolbar — center-top of the inner evidence board */}
        {innerRect && (
        <div
          data-board-ui
          style={{
            position: "absolute",
            top: innerRect.y - 12,
            left: innerRect.x + innerRect.width / 2,
            transform: "translate(-50%, -50%)",
          }}
          className={cn(
            "z-20",
            "flex items-center gap-2",
            "px-2.5 py-1.5",
          )}
        >
          {/* Mode Toggle */}
          <button
            type="button"
            data-board-ui
            aria-label={boardMode === "zoom" ? "Chuyển sang chế độ Ghim" : "Chuyển sang chế độ Zoom"}
            title={boardMode === "zoom" ? "Chuyển sang chế độ Ghim" : "Chuyển sang chế độ Zoom"}
            onClick={(e) => {
              e.stopPropagation();
              if (boardMode === "zoom") {
                switchToPinMode();
              } else {
                updateConnectionStartId(null);
                setBoardMode("zoom");
              }
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-[0.85rem] transition-all duration-300",
              boardMode === "pin"
                ? "text-primary"
                : "text-amber-200/80",
            )}
          >
            {boardMode === "zoom" ? "🔍" : "📌"}
          </button>


          {/* Case Arrow Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Hồ sơ trước"
              onClick={(e) => {
                e.stopPropagation();
                const currentIdx = CASES_LIST.findIndex((c) => c.id === currentCaseId);
                // Find previous non-locked case
                for (let i = currentIdx - 1; i >= 0; i--) {
                  if (CASES_LIST[i].status !== "locked") {
                    setCurrentCaseId(CASES_LIST[i].id);
                    updateUserPins([]);
                    updateUserConnections([]);
                    updateConnectionStartId(null);
                    hoveredPinRef.current = null;
                    setTooltip(null);
                    resetZoom();
                    break;
                  }
                }
              }}
              disabled={(() => {
                const idx = CASES_LIST.findIndex((c) => c.id === currentCaseId);
                return !CASES_LIST.slice(0, idx).some((c) => c.status !== "locked");
              })()}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[0.55rem] transition-all",
                "text-amber-200/70 hover:text-amber-100 hover:bg-amber-900/20",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              )}
            >
              ◀
            </button>
            <span className="font-mono text-[0.5rem] font-bold uppercase tracking-wider text-amber-200/80 min-w-[80px] text-center select-none">
              {activeCase.title}
            </span>
            <button
              type="button"
              aria-label="Hồ sơ sau"
              onClick={(e) => {
                e.stopPropagation();
                const currentIdx = CASES_LIST.findIndex((c) => c.id === currentCaseId);
                // Find next non-locked case
                for (let i = currentIdx + 1; i < CASES_LIST.length; i++) {
                  if (CASES_LIST[i].status !== "locked") {
                    setCurrentCaseId(CASES_LIST[i].id);
                    updateUserPins([]);
                    updateUserConnections([]);
                    updateConnectionStartId(null);
                    hoveredPinRef.current = null;
                    setTooltip(null);
                    resetZoom();
                    break;
                  }
                }
              }}
              disabled={(() => {
                const idx = CASES_LIST.findIndex((c) => c.id === currentCaseId);
                return !CASES_LIST.slice(idx + 1).some((c) => c.status !== "locked");
              })()}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[0.55rem] transition-all",
                "text-amber-200/70 hover:text-amber-100 hover:bg-amber-900/20",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              )}
            >
              ▶
            </button>
            </div>
        </div>
        )}
        {tooltip && tooltipStyle && (
          <div style={tooltipStyle} className="z-20 animate-fade-slide-up">
            <div
              className={cn(
                "max-w-[220px] rounded-lg",
                "border border-primary/40",
                "bg-card/95 px-3 py-2",
                "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
                "backdrop-blur-md",
              )}
            >
              <div
                className={cn(
                  "font-mono text-[0.55rem] font-bold",
                  "uppercase tracking-widest text-primary",
                )}
              >
                {tooltip.isUserPin
                  ? userPins[tooltip.pinIndex]?.label
                  : activeCase.pins[tooltip.pinIndex]?.label}
              </div>

              <div
                className={cn(
                  "mt-1 font-mono text-[0.6rem]",
                  "leading-relaxed text-muted-foreground",
                )}
              >
                {tooltip.isUserPin
                  ? "Ghim của điều tra viên"
                  : activeCase.pins[tooltip.pinIndex]?.detail}
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className={cn(
                  "h-0 w-0",
                  "border-l-[5px] border-l-transparent",
                  "border-r-[5px] border-r-transparent",
                  "border-t-[5px] border-t-primary/40",
                )}
              />
            </div>
          </div>
        )}



        {/* Zoom indicator */}
        {zoomActive && boardMode === "zoom" && (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute right-3 top-3 z-10",
              "flex items-center gap-1.5 rounded",
              "border border-primary/20",
              "bg-card/80 px-2 py-1 backdrop-blur-sm",
              "font-mono text-[0.55rem]",
              "uppercase tracking-widest text-primary/70",
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                "bg-primary motion-safe:animate-pulse",
              )}
            />
            ĐANG PHÓNG TO — NHẤP ĐỂ THU NHỎ
          </div>
        )}
      </div>
    </div>
  );
}
