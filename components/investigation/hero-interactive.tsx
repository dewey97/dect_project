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

export interface PinPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
  color?: "red" | "yellow" | "blue" | "green" | "black" | "purple" | "orange" | "cyan" | "brass" | "silver" | "dark";
  noteColor?: "yellow" | "black" | "white" | "red" | "blue";
  pinColor?: "red" | "yellow" | "blue" | "green" | "black" | "purple" | "orange" | "cyan" | "brass" | "silver" | "dark";
  pulseBorder?: boolean;
  photoUrl?: string;
}

export interface CaseConnection {
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
    id: "case-000",
    title: "TRỐN TÌM (1996)",
    description: "Chuyên án 000 — Bi kịch trốn tìm 20 năm trước tại xóm Bờ Sông",
    status: "active",
    bgImage: "/images/corkboard_vertical_empty.jpg",
    pins: [
      {
        id: "c0-pin-evidence",
        x: 0.22,
        y: 0.18,
        label: "BỔ SUNG CHỨNG CỨ",
        detail: "Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra",
        noteColor: "yellow",
      },
      {
        id: "c0-pin-question",
        x: 0.42,
        y: 0.18,
        label: "NGHI VẤN",
        detail: "Danh sách các nghi vấn & câu hỏi điều tra cần làm rõ",
        noteColor: "yellow",
      },
      {
        id: "c0-pin-suspects",
        x: 0.68,
        y: 0.32,
        label: "NGHI PHẠM",
        detail: "Tập hợp danh tính & thẩm tra nghi phạm (Tùng, Hà, Mai...)",
        noteColor: "yellow",
      },
      {
        id: "c0-pin-phone",
        x: 0.42,
        y: 0.27,
        label: "MỞ RỘNG ĐIỀU TRA",
        detail: "Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang",
        noteColor: "white",
      },
      {
        id: "c0-pin-reinvestigate",
        x: 0.22,
        y: 0.35,
        label: "BIÊN BẢN XIN KHÁM XÉT LẠI",
        detail: "Khám xét lại hiện trường để rà soát manh mối bổ sung",
        noteColor: "white",
      },
      {
        id: "c0-pin-indictment",
        x: 0.22,
        y: 0.80,
        label: "BẢN KẾT LUẬN ĐIỀU TRA",
        detail: "Bản kết luận điều tra và buộc tội thủ phạm vụ án",
        noteColor: "white",
        pinColor: "red",
      },
    ],
    connections: [
      { id: "c0-conn-1", fromPinId: "c0-pin-evidence", toPinId: "c0-pin-phone" },
      { id: "c0-conn-2", fromPinId: "c0-pin-evidence", toPinId: "c0-pin-reinvestigate" },
    ],
  },
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
    bgImage: "/evidence-board-bg2.jpg",
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
    bgImage: "/evidence-board-bg3.jpg",
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

const PIN_HIT_RADIUS = 38;
const PIN_GLOW_RADIUS = 50;

const FLASHLIGHT_RADIUS = 260;
const CENTER_LIGHT_RADIUS_RATIO = 0.75;

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

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3
): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return [text];

  // If the whole text fits on one line, return immediately
  if (context.measureText(text).width <= maxWidth) {
    return [text];
  }

  // If text has 3 to 6 words, try 2 balanced lines first (e.g. "Bản kết luận" / "điều tra")
  if (words.length >= 3 && words.length <= 6 && maxLines >= 2) {
    const splitIndex = Math.ceil(words.length / 2);
    const line1 = words.slice(0, splitIndex).join(" ");
    const line2 = words.slice(splitIndex).join(" ");
    if (context.measureText(line1).width <= maxWidth && context.measureText(line2).width <= maxWidth) {
      return [line1, line2];
    }
  }

  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = context.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        const remaining = words.slice(i).join(" ");
        lines.push(remaining);
        return lines;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Avoid orphan last word if 2 lines
  if (lines.length === 2 && lines[1].split(/\s+/).length === 1 && lines[0].split(/\s+/).length > 2) {
    const allWords = text.trim().split(/\s+/);
    const mid = Math.ceil(allWords.length / 2);
    const l1 = allWords.slice(0, mid).join(" ");
    const l2 = allWords.slice(mid).join(" ");
    if (context.measureText(l1).width <= maxWidth && context.measureText(l2).width <= maxWidth) {
      return [l1, l2];
    }
  }

  return lines;
}

function isPinHit(
  worldPointer: Point,
  pinPosition: Point,
  pin: PinPoint | { id: string; label: string },
  transform: ViewTransform,
): boolean {
  // Hit radius for pinhead (28px radius = 56px diameter touch target)
  const headHitRadius = 28 / transform.scale;
  if (distance(worldPointer.x, worldPointer.y, pinPosition.x, pinPosition.y) <= headHitRadius) {
    return true;
  }

  const isSuspectPin = pin.id.startsWith("node-suspect-") || pin.id.startsWith("suspect-");

  if (isSuspectPin) {
    // Hit area for Polaroid photo card underneath pinhead (matches ~112px width x 142px height)
    const cardHalfWidth = 60 / transform.scale;
    const cardTop = pinPosition.y - 16 / transform.scale;
    const cardBottom = pinPosition.y + 135 / transform.scale;
    const cardLeft = pinPosition.x - cardHalfWidth;
    const cardRight = pinPosition.x + cardHalfWidth;

    return (
      worldPointer.x >= cardLeft &&
      worldPointer.x <= cardRight &&
      worldPointer.y >= cardTop &&
      worldPointer.y <= cardBottom
    );
  }

  const upperLabel = (pin.label || '').toUpperCase();
  const isWhiteNote = (pin as any).noteColor === 'white' || 
    upperLabel.includes('MỞ RỘNG') || 
    upperLabel.includes('KHÁM XÉT') || 
    upperLabel.includes('KHÁM NGHIỆM') || 
    upperLabel.includes('KẾT LUẬN') ||
    upperLabel.includes('BIÊN BẢN') ||
    upperLabel.includes('TRUY TỐ');

  // Hit area for white note (~108x124) vs sticky note (~84x90) underneath pinhead
  const cardHalfWidth = (isWhiteNote ? 56 : 44) / transform.scale;
  const cardTop = pinPosition.y - (isWhiteNote ? 18 : 12) / transform.scale;
  const cardBottom = pinPosition.y + (isWhiteNote ? 112 : 80) / transform.scale;
  const cardLeft = pinPosition.x - cardHalfWidth;
  const cardRight = pinPosition.x + cardHalfWidth;

  return (
    worldPointer.x >= cardLeft &&
    worldPointer.x <= cardRight &&
    worldPointer.y >= cardTop &&
    worldPointer.y <= cardBottom
  );
}

/**
 * Calculate the board bounds (the inner transparent region of the frame)
 * in screen-space coordinates. This must be used consistently by both
 * the render loop and the pointer event handlers.
 */
function getInnerBoardBounds(
  containerWidth: number,
  containerHeight: number,
  _frameImg?: HTMLImageElement | null,
): BoardBounds {
  return {
    x: 0,
    y: 0,
    width: containerWidth,
    height: containerHeight,
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

export interface HeroInteractiveProps {
  className?: string;
  controlledCaseId?: string;
  customPins?: PinPoint[];
  customConnections?: CaseConnection[];
  customBgImage?: string;
  onPinClick?: (pinId: string, pin?: PinPoint) => void;
}

export function HeroInteractive({
  className,
  controlledCaseId,
  customPins,
  customConnections,
  customBgImage,
  onPinClick,
}: HeroInteractiveProps) {
  const customPinsRef = useRef<PinPoint[] | undefined>(customPins);
  const customConnectionsRef = useRef<CaseConnection[] | undefined>(customConnections);
  const onPinClickRef = useRef(onPinClick);

  useEffect(() => {
    onPinClickRef.current = onPinClick;
  }, [onPinClick]);

  useEffect(() => {
    customPinsRef.current = customPins;
    if (requestRenderRef.current) requestRenderRef.current();
  }, [customPins]);

  useEffect(() => {
    customConnectionsRef.current = customConnections;
    if (requestRenderRef.current) requestRenderRef.current();
  }, [customConnections]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const boardImageRef = useRef<HTMLImageElement | null>(null);
  const boardFrameRef = useRef<HTMLImageElement | null>(null);

  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskContextRef = useRef<CanvasRenderingContext2D | null>(null);

  const suspectImageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const resolveSuspectPhotoUrl = (pin: { id: string; label: string; photoUrl?: string }): string | undefined => {
    if (pin.photoUrl) return pin.photoUrl;
    const lower = `${pin.id} ${pin.label}`.toLowerCase();
    if (lower.includes('thi-the') || lower.includes('thi the') || lower.includes('hiện trường') || lower.includes('crime-scene') || lower.includes('crime_scene')) {
      return '/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png';
    }
    if (lower.includes('vu') || lower.includes('vũ')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vu.png';
    if (lower.includes('tung') || lower.includes('tùng')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_tung.png';
    if (lower.includes('ha') || lower.includes('hà')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ha.png';
    if (lower.includes('mai')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_mai.png';
    if (lower.includes('dat') || lower.includes('đạt')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_dat_ga.png';
    if (lower.includes('lua') || lower.includes('lụa')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ba_lua.png';
    if (lower.includes('khang')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png';
    if (lower.includes('vy')) return '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vy.png';
    return undefined;
  };

  const getLoadedImage = (url: string): HTMLImageElement | null => {
    if (!url) return null;
    let img = suspectImageCacheRef.current.get(url);
    if (!img) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        if (requestRenderRef.current) requestRenderRef.current();
      };
      suspectImageCacheRef.current.set(url, img);
    }
    return img.complete && img.naturalWidth > 0 ? img : null;
  };

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
  const [internalCaseId, setInternalCaseId] = useState<string>("case-01");
  const currentCaseId = controlledCaseId ?? internalCaseId;
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

  const updateHoveredPin = useCallback((_screenX: number, _screenY: number) => {
    // Hover disabled by design - pins stay completely static
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

        const worldHitRadius = PIN_HIT_RADIUS / transform.scale;
        const caseSysPins = customPinsRef.current ?? activeCaseRef.current.pins;
        let bestHitPin: PinPoint | null = null;
        let minDistance = Infinity;

        // Check all system/custom pins and pick the closest one to pointer location, prioritizing suspect photos
        for (let index = 0; index < caseSysPins.length; index += 1) {
          const pin = caseSysPins[index];
          const pinPosition = getPinWorldPosition(pin, bounds);

          if (isPinHit(worldPointer, pinPosition, pin, transform)) {
            const dist = distance(worldPointer.x, worldPointer.y, pinPosition.x, pinPosition.y);
            const isSuspect = pin.id.startsWith("node-suspect-") || pin.id.startsWith("suspect-");

            if (!bestHitPin) {
              minDistance = dist;
              bestHitPin = pin;
            } else if (isSuspect && !bestHitPin.id.startsWith("node-suspect-") && !bestHitPin.id.startsWith("suspect-")) {
              minDistance = dist;
              bestHitPin = pin;
            } else if (dist < minDistance && !(bestHitPin.id.startsWith("node-suspect-") && !isSuspect)) {
              minDistance = dist;
              bestHitPin = pin;
            }
          }
        }

        if (bestHitPin && onPinClickRef.current) {
          onPinClickRef.current(bestHitPin.id, bestHitPin);
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
  }, [controlledCaseId, internalCaseId, updateUserPins, updateUserConnections, updateConnectionStartId]);

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

      context.save();

      // Apply zoom & pan transform ONLY for the inner map contents
      context.translate(transform.translateX, transform.translateY);
      context.scale(transform.scale, transform.scale);

      // 2.1 Draw case evidence map with refined focus on corkboard surface
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
          id: p.id,
          x: p.x,
          y: p.y,
          label: p.label,
          color: (p as any).color,
          noteColor: (p as any).noteColor,
          pinColor: (p as any).pinColor,
          pulseBorder: (p as any).pulseBorder,
          photoUrl: (p as any).photoUrl,
          isUser: false,
        })),
        ...uPins.map((p) => ({
          id: p.id,
          x: p.x,
          y: p.y,
          label: p.label,
          color: "yellow" as const,
          noteColor: "yellow" as const,
          pinColor: "yellow" as const,
          pulseBorder: false,
          photoUrl: undefined,
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
          pin.noteColor ||
          (pin.color === "black" ? "black" : "yellow");

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

        // Calculate a subtle organic size variation for each item
        const charSum = pin.id.split("").reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 3), 0);
        const sizeVariant = ((charSum % 7) - 3) * 0.024;
        const scaleMod = 1.0 + sizeVariant;

        const isSuspectPin = pin.id.startsWith("node-suspect-") || pin.id.startsWith("suspect-") || !!(pin as any).photoUrl || pin.id.includes("thi-the") || pin.id.includes("crime-scene");

        context.save();
        context.translate(pinPosition.x, pinPosition.y);

        if (isSuspectPin) {
          // ── REALISTIC PINNED SUSPECT PHOTO CARD ASSET (WITH BEIGE TAPE & NAME) ──
          const suspectPhotoUrl = resolveSuspectPhotoUrl(pin);
          const loadedSuspectImg = suspectPhotoUrl ? getLoadedImage(suspectPhotoUrl) : null;

          if (loadedSuspectImg) {
            const imgW = loadedSuspectImg.naturalWidth || loadedSuspectImg.width || 300;
            const imgH = loadedSuspectImg.naturalHeight || loadedSuspectImg.height || 380;
            const isKhang = pin.id.includes('khang') || (pin.label && pin.label.toLowerCase().includes('khang'));
            const isCrimeScene = pin.id.includes('crime-scene') || pin.id.includes('thi-the') || (pin.label && pin.label.toLowerCase().includes('thi thể'));
            const baseCardWidth = isKhang ? 146 : isCrimeScene ? 134 : 108;
            const cardWidth = (baseCardWidth * scaleMod) / transform.scale;
            const cardHeight = (cardWidth * imgH) / imgW;

            const tagX = -cardWidth / 2;
            const tagY = isCrimeScene ? -cardHeight * 0.05 : -cardHeight * 0.10;

            // Render complete pre-rendered photo card (includes photo, beige tape + name, yellow pin, drop shadow)
            context.drawImage(loadedSuspectImg, tagX, tagY, cardWidth, cardHeight);
          } else {
            // Lightweight fallback while image is loading
            const isKhang = pin.id.includes('khang') || (pin.label && pin.label.toLowerCase().includes('khang'));
            const isCrimeScene = pin.id.includes('crime-scene') || pin.id.includes('thi-the') || (pin.label && pin.label.toLowerCase().includes('thi thể'));
            const baseCardWidth = isKhang ? 126 : isCrimeScene ? 114 : 92;
            const baseCardHeight = isKhang ? 162 : isCrimeScene ? 144 : 118;
            const cardWidth = (baseCardWidth * scaleMod) / transform.scale;
            const cardHeight = (baseCardHeight * scaleMod) / transform.scale;
            context.fillStyle = "#f5f2eb";
            context.fillRect(-cardWidth / 2, 0, cardWidth, cardHeight);
          }
        } else {
          // ── DISTINGUISH WHITE PINNED NOTES vs YELLOW STICKY NOTES ──
          const upperLabel = (pin.label || '').toUpperCase();
          const isWhiteNote = (pin as any).noteColor === 'white' || 
            upperLabel.includes('MỞ RỘNG') || 
            upperLabel.includes('KHÁM XÉT') || 
            upperLabel.includes('KHÁM NGHIỆM') || 
            upperLabel.includes('KẾT LUẬN') ||
            upperLabel.includes('BIÊN BẢN') ||
            upperLabel.includes('TRUY TỐ');

          let noteUrl = '';
          let isPreRendered = false;

          if (pin.id === 'c0-pin-evidence' || upperLabel.includes('CHỨNG CỨ')) {
            noteUrl = '/images/cases/case_000/clue_notes/rendered_notes/note_bo_sung_chung_cu.png';
            isPreRendered = true;
          } else if (pin.id === 'c0-pin-suspects' || upperLabel.includes('NGHI PHẠM')) {
            noteUrl = '/images/cases/case_000/clue_notes/rendered_notes/note_nghi_pham.png';
            isPreRendered = true;
          } else if (
            pin.id === 'c0-pin-followup-vu' ||
            pin.id === 'c0-pin-followup-tung' ||
            pin.id === 'c0-pin-followup-ha' ||
            pin.id === 'c0-pin-question' ||
            pin.id.startsWith('c0-pin-followup') ||
            upperLabel.includes('NGHI VẤN') ||
            upperLabel.includes('CÂU HỎI')
          ) {
            noteUrl = '/images/cases/case_000/clue_notes/rendered_notes/note_nghi_van.png';
            isPreRendered = true;
          } else if (pin.id === 'c0-pin-phone' || upperLabel.includes('MỞ RỘNG')) {
            noteUrl = '/images/cases/case_000/clue_notes/rendered_notes/note_mo_rong_dieu_tra.png';
            isPreRendered = true;
          } else if (pin.id === 'c0-pin-reinvestigate' || upperLabel.includes('KHÁM XÉT') || upperLabel.includes('KHÁM NGHIỆM')) {
            noteUrl = '/images/cases/case_000/clue_notes/rendered_notes/note_kham_xet_lai.png';
            isPreRendered = true;
          } else if (pin.id === 'c0-pin-indictment' || upperLabel.includes('KẾT LUẬN') || upperLabel.includes('TRUY TỐ')) {
            noteUrl = '/images/cases/case_000/clue_notes/rendered_notes/note_ket_luan_dieu_tra.png';
            isPreRendered = true;
          } else if (isWhiteNote) {
            const whiteVariants = [
              '/images/cases/case_000/clue_notes/clean_note_white_1.png',
              '/images/cases/case_000/clue_notes/clean_note_white_2.png',
              '/images/cases/case_000/clue_notes/clean_note_white_3.png',
              '/images/cases/case_000/clue_notes/clean_note_white_4.png',
              '/images/cases/case_000/clue_notes/clean_note_white_5.png',
              '/images/cases/case_000/clue_notes/clean_note_white_6.png',
              '/images/cases/case_000/clue_notes/clean_note_white_7.png',
              '/images/cases/case_000/clue_notes/clean_note_white_8.png',
              '/images/cases/case_000/clue_notes/clean_note_white_9.png',
              '/images/cases/case_000/clue_notes/clean_note_white_10.png',
              '/images/cases/case_000/clue_notes/clean_note_white_11.png',
            ];
            const hash = (pin.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            noteUrl = whiteVariants[Math.abs(hash) % whiteVariants.length];
          } else {
            const yellowVariants = [
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_1.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_2.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_3.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_4.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_5.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_6.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_7.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_8.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_9.png',
              '/images/cases/case_000/clue_notes/clean_sticky_yellow_10.png',
            ];
            const hash = (pin.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            noteUrl = yellowVariants[Math.abs(hash) % yellowVariants.length];
          }

          const loadedNoteImg = getLoadedImage(noteUrl);

          const isIndictment = pin.id === 'c0-pin-indictment' || upperLabel.includes('KẾT LUẬN');
          const sizeMultiplier = 1.0; // Same size across all white notes

          // Note size: preserve aspect ratio cleanly without distortion
          const baseCardWidth = isWhiteNote ? 104 : 84;
          const noteWidth = (baseCardWidth * scaleMod * sizeMultiplier) / transform.scale;

          let noteHeight = noteWidth;
          if (loadedNoteImg && loadedNoteImg.naturalWidth && loadedNoteImg.naturalHeight) {
            noteHeight = (noteWidth * loadedNoteImg.naturalHeight) / loadedNoteImg.naturalWidth;
          } else {
            noteHeight = noteWidth * (isWhiteNote ? 1.18 : 1.0);
          }

          let pinAnchorX = 0.50;
          let pinAnchorY = 0.08;

          if (pin.id === 'c0-pin-evidence' || upperLabel.includes('CHỨNG CỨ')) {
            pinAnchorX = 0.50;
            pinAnchorY = 0.080;
          } else if (pin.id === 'c0-pin-suspects' || upperLabel.includes('NGHI PHẠM')) {
            pinAnchorX = 0.50;
            pinAnchorY = 0.080;
          } else if (
            pin.id === 'c0-pin-followup-vu' ||
            pin.id === 'c0-pin-followup-tung' ||
            pin.id === 'c0-pin-followup-ha' ||
            pin.id === 'c0-pin-question' ||
            upperLabel.includes('NGHI VẤN') ||
            upperLabel.includes('CÂU HỎI')
          ) {
            pinAnchorX = 0.50;
            pinAnchorY = 0.080;
          } else if (pin.id === 'c0-pin-phone' || upperLabel.includes('MỞ RỘNG')) {
            pinAnchorX = 0.50;
            pinAnchorY = 0.075;
          } else if (pin.id === 'c0-pin-reinvestigate' || upperLabel.includes('KHÁM XÉT') || upperLabel.includes('KHÁM NGHIỆM')) {
            pinAnchorX = 0.50;
            pinAnchorY = 0.075;
          } else if (pin.id === 'c0-pin-indictment' || upperLabel.includes('KẾT LUẬN')) {
            pinAnchorX = 0.50;
            pinAnchorY = 0.075;
          }

          const tagX = -noteWidth * pinAnchorX;
          const tagY = -noteHeight * pinAnchorY;

          // Draw the realistic Ultra HD note PNG asset (preserving rich wrinkles, natural edges, and texture)
          if (loadedNoteImg) {
            context.drawImage(loadedNoteImg, tagX, tagY, noteWidth, noteHeight);
          } else {
            // Fallback fill
            context.fillStyle = isWhiteNote ? "#faf8f2" : "#fde047";
            context.fillRect(tagX, tagY, noteWidth, noteHeight);
          }

          // Pulsing border highlight if active
          if ((pin as any).pulseBorder) {
            const pulseGlow = (Math.sin(timestamp / 220) + 1) / 2;
            context.save();
            context.shadowColor = `rgba(245, 158, 11, ${0.45 + pulseGlow * 0.55})`;
            context.shadowBlur = (8 + pulseGlow * 12) / transform.scale;
            context.strokeStyle = `rgba(253, 224, 71, ${0.75 + pulseGlow * 0.25})`;
            context.lineWidth = (2.2 + pulseGlow * 1.5) / transform.scale;
            context.strokeRect(tagX, tagY, noteWidth, noteHeight);
            context.restore();
          }

          // Render handwritten text (only if not using pre-rendered note asset or while loading)
          if (!isPreRendered || !loadedNoteImg) {
            const paperFaceCenterX = tagX + noteWidth / 2;
            const paperFaceCenterY = tagY + noteHeight * 0.52;
            const maxTextWidth = noteWidth * (isWhiteNote ? 0.65 : 0.72);
            const availableHeight = noteHeight * (isWhiteNote ? 0.55 : 0.60);

            let fontSize = isIndictment ? 12.0 : isWhiteNote ? 11.0 : 10.5;
            context.font = `700 ${fontSize / transform.scale}px 'Caveat', 'Playpen Sans', 'Segoe Print', cursive, sans-serif`;
            let lines = wrapText(context, pin.label, maxTextWidth, 3);

            while (
              fontSize > 7.0 &&
              (lines.some((l) => context.measureText(l).width > maxTextWidth) ||
               lines.length * ((fontSize + 1.5) / transform.scale) > availableHeight)
            ) {
              fontSize -= 0.5;
              context.font = `700 ${fontSize / transform.scale}px 'Caveat', 'Playpen Sans', 'Segoe Print', cursive, sans-serif`;
              lines = wrapText(context, pin.label, maxTextWidth, 3);
            }

            const lineHeight = (fontSize + 1.5) / transform.scale;
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
        }

        context.restore(); // restore paper / polaroid transform

        // Pinhole puncture
        context.save();
        context.fillStyle = "rgba(35, 20, 10, 0.85)";
        context.beginPath();
        context.arc(pinPosition.x, pinPosition.y, 1.6 / transform.scale, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      // ──────────────────────────────────
      // 3. Layer 2: Draw Evidence Strings & Connecting Lines (ON TOP OF CARDS)
      // ──────────────────────────────────
      const caseConns = customConnectionsRef.current ?? activeCaseRef.current.connections;
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
          const bow = (dx >= 0 ? -1 : 1) * Math.min(10 / transform.scale, dist * 0.04);
          middleX += bow;
        } else {
          const sag = Math.max(8 / transform.scale, Math.min(30 / transform.scale, dist * 0.08));
          middleY += sag;
        }

        // Subtle thin string shadow onto cards/board
        context.save();
        context.strokeStyle = "rgba(0, 0, 0, 0.20)";
        context.lineWidth = 1.0 / transform.scale;
        context.shadowColor = "rgba(0, 0, 0, 0.25)";
        context.shadowBlur = 2.5 / transform.scale;
        context.beginPath();
        context.moveTo(start.x + 0.8 / transform.scale, start.y + 1.2 / transform.scale);
        context.quadraticCurveTo(middleX + 0.8 / transform.scale, middleY + 1.2 / transform.scale, end.x + 0.8 / transform.scale, end.y + 1.2 / transform.scale);
        context.stroke();
        context.restore();

        // Fine Crimson Yarn thread (thin & elegant)
        context.save();
        context.strokeStyle = "rgba(200, 35, 35, 0.85)";
        context.lineWidth = 1.15 / transform.scale;
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
        const sag = Math.max(18, Math.min(50, dist * 0.09));

        const middleX = (start.x + end.x) / 2;
        const middleY = (start.y + end.y) / 2 + sag;

        // Custom string shadow
        context.save();
        context.strokeStyle = "rgba(0, 0, 0, 0.22)";
        context.lineWidth = 1.0 / transform.scale;
        context.beginPath();
        context.moveTo(start.x + 0.8 / transform.scale, start.y + 1.2 / transform.scale);
        context.quadraticCurveTo(middleX + 0.8 / transform.scale, middleY + 1.2 / transform.scale, end.x + 0.8 / transform.scale, end.y + 1.2 / transform.scale);
        context.stroke();
        context.restore();

        // Custom user connection fine crimson thread
        context.save();
        context.strokeStyle = "rgba(225, 45, 45, 0.85)";
        context.lineWidth = 1.1 / transform.scale;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(middleX, middleY, end.x, end.y);
        context.stroke();
        context.restore();
      });

      // Active connector wire while dragging
      if (connectionStartIdRef.current && pointer.active) {
        const start = pinPositionsMap.get(connectionStartIdRef.current);
        if (start) {
          const pointerWorld = screenToWorld(
            { x: pointer.x, y: pointer.y },
            transform,
          );
          context.save();
          context.strokeStyle = "rgba(255, 235, 80, 0.85)"; // gold dashed line for active connection
          context.lineWidth = 2.0 / transform.scale;
          context.setLineDash([4 / transform.scale, 4 / transform.scale]);
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
        const isLeftHalf = pin.x !== undefined ? pin.x < 0.5 : pinPosition.x < boardCenterX;
        const isFlipped = isLeftHalf;

        const pinUrl = isFlipped
          ? `/images/pins/pin-${colorKey}-flipped.png`
          : `/images/pins/pin-${colorKey}.png`;
        const pinImg = getLoadedImage(pinUrl) || getLoadedImage(`/images/pins/pin-${colorKey}.png`);

        if (pinImg && pinImg.complete && pinImg.naturalWidth > 0) {
          // Uniform size for all pins (26px scaled = 2px smaller than original 28px yellow pin)
          const pinDisplayWidth = 26 / transform.scale;
          const pinDisplayHeight = pinDisplayWidth * (pinImg.naturalHeight / pinImg.naturalWidth);

          // Align the needle piercing point with pinPosition (piercing tip enters board at pinPosition)
          const drawX = pinPosition.x - pinDisplayWidth * (isFlipped ? 0.49 : 0.51);
          const drawY = pinPosition.y - pinDisplayHeight * 0.70;

          context.save();
          if (isRedPin && (pin.pulseBorder ?? true)) {
            // Subtle glowing aura for main investigation target
            context.shadowColor = "rgba(239, 68, 68, 0.75)";
            context.shadowBlur = 10 / transform.scale;
          }
          context.drawImage(pinImg, drawX, drawY, pinDisplayWidth, pinDisplayHeight);
          context.restore();
        } else {
          // Fallback procedural canvas render while asset loads
          const baseRadius = 5.5 / transform.scale;
          let headTheme = {
            headBase: "#dc2626",
            headMid: "#b91c1c",
            headHighlight: "#fca5a5",
            headRim: "#7f1d1d",
          };

          if (colorKey === "yellow" || colorKey === "brass") {
            headTheme = { headBase: "#d97706", headMid: "#b45309", headHighlight: "#fde047", headRim: "#78350f" };
          } else if (colorKey === "blue" || colorKey === "cyan") {
            headTheme = { headBase: "#0284c7", headMid: "#0369a1", headHighlight: "#7dd3fc", headRim: "#0c4a6e" };
          } else if (colorKey === "green") {
            headTheme = { headBase: "#16a34a", headMid: "#15803d", headHighlight: "#86efac", headRim: "#14532d" };
          } else if (colorKey === "dark") {
            headTheme = { headBase: "#27272a", headMid: "#18181b", headHighlight: "#a1a1aa", headRim: "#09090b" };
          }

          context.save();
          context.fillStyle = "rgba(0, 0, 0, 0.45)";
          context.beginPath();
          context.ellipse(
            pinPosition.x + (isRedPin ? 2.2 : 1.8) / transform.scale,
            pinPosition.y + (isRedPin ? 3.0 : 2.5) / transform.scale,
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

          const hasPulsingPins = (customPinsRef.current ?? activeCaseRef.current.pins).some(
            (p) => (p as any).pulseBorder
          );

          const shouldContinueAnimating =
            !reducedMotionRef.current &&
            (hoveredPinRef.current !== null ||
              connectionStartIdRef.current !== null ||
              hasPulsingPins);

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
        "flex h-full w-full flex-col overflow-hidden rounded-none border-0 bg-[#0a0705]",
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
          "cursor-default select-none touch-none",
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
