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

  if (context.measureText(text).width <= maxWidth) {
    return [text];
  }

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

export function isPinHit(
  worldPointer: Point,
  pinPosition: Point,
  pin: PinPoint | { id: string; label: string },
  transform: ViewTransform,
  bounds?: BoardBounds,
): boolean {
  const scaleFactor =
    bounds && bounds.width > 0 ? bounds.width / BOARD_BASE_WIDTH : 1.0;
  const rawPin = pin as any;
  const userScale =
    typeof rawPin.scale === "number" && rawPin.scale > 0 ? rawPin.scale : 1.0;
  const userRot = typeof rawPin.rotation === "number" ? rawPin.rotation : 0;

  const headHitRadius = (18 * scaleFactor) / transform.scale;
  if (
    distance(worldPointer.x, worldPointer.y, pinPosition.x, pinPosition.y) <=
    headHitRadius
  ) {
    return true;
  }

  const dx = worldPointer.x - pinPosition.x;
  const dy = worldPointer.y - pinPosition.y;
  const rad = (-userRot * Math.PI) / 180;
  const unrotX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const unrotY = dx * Math.sin(rad) + dy * Math.cos(rad);

  const isFollowup =
    pin.id.startsWith("c0-pin-followup") || pin.id.startsWith("followup-");
  const isVictimPhone =
    pin.id === "c0-pin-victim-phone" ||
    (pin.id.includes("phone") &&
      pin.id !== "c0-pin-phone" &&
      Boolean((pin as any).photoUrl));
  const isKhang =
    !isFollowup &&
    !isVictimPhone &&
    (pin.id.includes("khang") ||
      (pin.label && pin.label.toLowerCase().includes("khang")));
  const isCrimeScene =
    !isFollowup &&
    (pin.id.includes("crime-scene") ||
      pin.id.includes("thi-the") ||
      (pin.label && pin.label.toLowerCase().includes("thi thể")));
  const isSuspectPin =
    !isFollowup &&
    (pin.id.startsWith("node-suspect-") ||
      pin.id.startsWith("suspect-") ||
      !!(pin as any).photoUrl ||
      isKhang ||
      isCrimeScene ||
      isVictimPhone);

  let baseCardWidth = 142;
  let baseCardHeight = 167;
  let tagYRatio = -0.08;

  if (isSuspectPin) {
    baseCardWidth = isKhang
      ? 204
      : isCrimeScene
        ? 186
        : isVictimPhone
          ? 135
          : 158;
    baseCardHeight = isCrimeScene
      ? (baseCardWidth * 420) / 560
      : isVictimPhone
        ? (baseCardWidth * 997) / 757
        : (baseCardWidth * 380) / 300;
    tagYRatio = isCrimeScene ? -0.05 : isVictimPhone ? -0.04 : -0.1;
  } else {
    const upperLabel = (pin.label || "").toUpperCase();
    const isWhiteNote =
      (pin as any).noteColor === "white" ||
      upperLabel.includes("MỞ RỘNG") ||
      upperLabel.includes("KHÁM XÉT") ||
      upperLabel.includes("KHÁM NGHIỆM") ||
      upperLabel.includes("KẾT LUẬN") ||
      upperLabel.includes("BIÊN BẢN") ||
      upperLabel.includes("TRUY TỐ");

    baseCardWidth = isFollowup ? 144 : isWhiteNote ? 142 : 115;
    baseCardHeight = isFollowup ? 132 : isWhiteNote ? 167 : 115;
  }

  const cardW = (baseCardWidth * scaleFactor * userScale) / transform.scale;
  const cardH = (baseCardHeight * scaleFactor * userScale) / transform.scale;
  const tagX = -cardW * 0.5;
  const tagY = tagYRatio * cardH;

  const pad = 2 / transform.scale;

  return (
    unrotX >= tagX - pad &&
    unrotX <= tagX + cardW + pad &&
    unrotY >= tagY - pad &&
    unrotY <= tagY + cardH + pad
  );
}

export function getInnerBoardBounds(
  containerWidth: number,
  containerHeight: number,
  _frameImg?: HTMLImageElement | null,
): BoardBounds {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { x: 0, y: 0, width: BOARD_BASE_WIDTH, height: BOARD_BASE_HEIGHT };
  }

  const containerAspect = containerWidth / containerHeight;
  let width = containerWidth;
  let height = containerHeight;
  let x = 0;
  let y = 0;

  if (containerAspect > BOARD_ASPECT) {
    height = containerHeight;
    width = height * BOARD_ASPECT;
    x = (containerWidth - width) / 2;
    y = 0;
  } else {
    width = containerWidth;
    height = width / BOARD_ASPECT;
    x = 0;
    y = (containerHeight - height) / 2;
  }

  return {
    x,
    y,
    width,
    height,
  };
}

export function getViewTransform(zoom: ZoomState, pan: Point): ViewTransform {
  if (!zoom.active) {
    return {
      scale: 1,
      translateX: 0,
      translateY: 0,
    };
  }

  return {
    scale: ZOOM_SCALE,
    translateX: zoom.originX * (1 - ZOOM_SCALE) + pan.x,
    translateY: zoom.originY * (1 - ZOOM_SCALE) + pan.y,
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
