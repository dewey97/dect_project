import {
  BOARD_ASPECT,
  BOARD_BASE_HEIGHT,
  BOARD_BASE_WIDTH,
  ZOOM_SCALE,
} from "./constants";
import type {
  BoardBounds,
  PinPoint,
  Point,
  ViewTransform,
  ZoomState,
} from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3,
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
    if (
      context.measureText(line1).width <= maxWidth &&
      context.measureText(line2).width <= maxWidth
    ) {
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
  if (
    lines.length === 2 &&
    lines[1].split(/\s+/).length === 1 &&
    lines[0].split(/\s+/).length > 2
  ) {
    const allWords = text.trim().split(/\s+/);
    const mid = Math.ceil(allWords.length / 2);
    const l1 = allWords.slice(0, mid).join(" ");
    const l2 = allWords.slice(mid).join(" ");
    if (
      context.measureText(l1).width <= maxWidth &&
      context.measureText(l2).width <= maxWidth
    ) {
      return [l1, l2];
    }
  }

  return lines;
}

export type HitTargetPin = Partial<PinPoint> & { id: string; label: string };

export function isPinHit(
  worldPointer: Point,
  pinPosition: Point,
  pin: HitTargetPin,
  transform: ViewTransform,
  bounds?: BoardBounds,
): boolean {
  const scaleFactor =
    bounds && bounds.width > 0 ? bounds.width / BOARD_BASE_WIDTH : 1.0;
  const userScale =
    typeof pin.scale === "number" && pin.scale > 0 ? pin.scale : 1.0;
  const userRot = typeof pin.rotation === "number" ? pin.rotation : 0;

  // Hit radius for pinhead (18px scaled by scaleFactor)
  const headHitRadius = (18 * scaleFactor) / transform.scale;
  if (
    distance(worldPointer.x, worldPointer.y, pinPosition.x, pinPosition.y) <=
    headHitRadius
  ) {
    return true;
  }

  // Un-rotate worldPointer relative to pinPosition into card local coordinate frame
  const dx = worldPointer.x - pinPosition.x;
  const dy = worldPointer.y - pinPosition.y;
  const rad = (-userRot * Math.PI) / 180;
  const unrotX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const unrotY = dx * Math.sin(rad) + dy * Math.cos(rad);

  const isFollowup =
    pin.nodeKind === "followup" ||
    pin.id.startsWith("followup-");
  const isVictimPhone =
    pin.nodeKind === "victim_phone" ||
    (pin.id.includes("phone") &&
      pin.nodeKind !== "phone_lookup" &&
      Boolean(pin.photoUrl));
  const isReinvestigateProp =
    pin.nodeKind === "reinvestigate" ||
    pin.id.includes("reinvestigate") ||
    Boolean(
      pin.photoUrl &&
      (pin.photoUrl.includes("crime_scene") ||
        pin.photoUrl.includes("reinvestigation")),
    );
  const isVictim =
    pin.nodeKind === "victim" ||
    (!isFollowup &&
      !isVictimPhone &&
      !isReinvestigateProp &&
      Boolean(pin.role === "victim" || (pin.label && pin.label.toLowerCase().includes("nạn nhân"))));
  const isCrimeScene =
    !isFollowup &&
    (pin.id.includes("crime-scene") ||
      pin.id.includes("thi-the") ||
      (pin.label && pin.label.toLowerCase().includes("thi thể")));
  const isSuspectPin =
    !isFollowup &&
    (pin.nodeKind === "suspect" ||
      pin.nodeKind === "victim" ||
      pin.id.startsWith("node-suspect-") ||
      pin.id.startsWith("suspect-") ||
      Boolean(pin.photoUrl) ||
      isVictim ||
      isCrimeScene ||
      isVictimPhone ||
      isReinvestigateProp);

  let baseCardWidth = 142;
  let baseCardHeight = 167;
  let tagYRatio = -0.08;

  if (isSuspectPin) {
    baseCardWidth = isVictim
      ? 204
      : isCrimeScene
        ? 186
        : isVictimPhone
          ? 135
          : isReinvestigateProp
            ? 195
            : 158;
    baseCardHeight = isCrimeScene
      ? (baseCardWidth * 420) / 560
      : isVictimPhone
        ? (baseCardWidth * 997) / 757
        : isReinvestigateProp
          ? (baseCardWidth * 1080) / 1463
          : (baseCardWidth * 380) / 300;
    tagYRatio = isCrimeScene
      ? -0.05
      : isVictimPhone
        ? -0.04
        : isReinvestigateProp
          ? -0.05
          : -0.1;
  } else {
    const upperLabel = (pin.label || "").toUpperCase();
    const isWhiteNote =
      pin.noteColor === "white" ||
      upperLabel.includes("MỞ RỘNG") ||
      upperLabel.includes("KHÁM XÉT") ||
      upperLabel.includes("KHÁM NGHIỆM") ||
      upperLabel.includes("KẾT LUẬN") ||
      upperLabel.includes("BIÊN BẢN") ||
      upperLabel.includes("TRUY TỐ");

    baseCardWidth = isFollowup ? 144 : isWhiteNote ? 142 : 115;
    baseCardHeight = isFollowup ? 132 : isWhiteNote ? 167 : 115;
  }

  // Width & height in world space (matching canvas render)
  const cardW = (baseCardWidth * scaleFactor * userScale) / transform.scale;
  const cardH = (baseCardHeight * scaleFactor * userScale) / transform.scale;
  const tagX = -cardW * 0.5;
  const tagY = tagYRatio * cardH;

  const pad = 2 / transform.scale; // Accurate bounding box

  return (
    unrotX >= tagX - pad &&
    unrotX <= tagX + cardW + pad &&
    unrotY >= tagY - pad &&
    unrotY <= tagY + cardH + pad
  );
}

/**
 * Calculate the board bounds in screen-space coordinates.
 * Preserves the exact aspect ratio of the corkboard (896:1200)
 * fitting completely within the container on both Desktop and Mobile.
 */
export function getInnerBoardBounds(
  containerWidth: number,
  containerHeight: number,
  _frameImg?: HTMLImageElement | null,
): BoardBounds {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { x: 0, y: 0, width: BOARD_BASE_WIDTH, height: BOARD_BASE_HEIGHT };
  }

  // Bảng điều tra co giãn lấp đầy 100% không gian vùng hiển thị (Full-bleed Board),
  // luôn bám sát theo các thanh kéo điều chỉnh độ rộng (resize split handles).
  return {
    x: 0,
    y: 0,
    width: containerWidth,
    height: containerHeight,
  };
}

export function getViewTransform(_zoom: ZoomState, _pan: Point): ViewTransform {
  // Option 2: Khóa cố định 100% bảng điều tra (Full Fixed Board)
  // Bảng luôn fit chính giữa màn hình với scale = 1, translateX = 0, translateY = 0
  return {
    scale: 1,
    translateX: 0,
    translateY: 0,
  };
}

export function worldToScreen(
  worldPoint: Point,
  transform: ViewTransform,
): Point {
  return {
    x: worldPoint.x * transform.scale + transform.translateX,
    y: worldPoint.y * transform.scale + transform.translateY,
  };
}

export function screenToWorld(
  screenPoint: Point,
  transform: ViewTransform,
): Point {
  return {
    x: (screenPoint.x - transform.translateX) / transform.scale,
    y: (screenPoint.y - transform.translateY) / transform.scale,
  };
}

export function getPinWorldPosition(pin: PinPoint, bounds: BoardBounds): Point {
  return {
    x: bounds.x + pin.x * bounds.width,
    y: bounds.y + pin.y * bounds.height,
  };
}
