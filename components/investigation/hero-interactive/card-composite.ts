import { normalizeImageUrl } from "@/lib/utils";
import { findValidCaseCharacter } from "@/lib/cases/case-000-suspects";

export const resolveSuspectPhotoUrl = (
  pin: {
    id: string;
    label: string;
    photoUrl?: string;
  },
  photosMap?: Map<string, string>,
  caseId?: string,
): string | undefined => {
  if (pin.photoUrl) return normalizeImageUrl(pin.photoUrl);
  if (
    pin.id.includes("-pin-followup") ||
    pin.id.includes("-pin-question") ||
    pin.id.includes("-pin-clue") ||
    pin.id.includes("-pin-evidence") ||
    pin.id.includes("-pin-phone") ||
    pin.id.includes("-pin-reinvestigate") ||
    pin.id.includes("-pin-indictment") ||
    pin.id.endsWith("-pin-suspects") ||
    pin.id.includes("suspects_hub")
  ) {
    return undefined;
  }
  const lower = `${pin.id} ${pin.label}`.toLowerCase();
  const isCrimeScenePin =
    lower.includes("thi-the") ||
    lower.includes("thi the") ||
    lower.includes("hiện trường") ||
    lower.includes("crime-scene") ||
    lower.includes("crime_scene") ||
    lower.includes("chalk");

  // 1. Check live photos map first (Live-First rule)
  const isDefaultCase = !caseId || caseId === "case-000" || caseId === "case_000";
  if (photosMap) {
    if (isCrimeScenePin) {
      const liveCrime =
        photosMap.get("crime_scene") ||
        photosMap.get("chalk_outline") ||
        photosMap.get("thi_the");
      if (liveCrime) return liveCrime;
    }
    if ((pin as any).nodeKind === "victim" || pin.id.includes("victim")) {
      const liveVictim = photosMap.get("avatar_victim") || photosMap.get("victim");
      if (liveVictim) return liveVictim;
    }

    const directCode = photosMap.get(pin.id.toLowerCase().trim());
    if (directCode) return directCode;
    const directLabel = photosMap.get(pin.label.toLowerCase().trim());
    if (directLabel) return directLabel;

    // Fallback to case-000 static character list only for case-000
    if (isDefaultCase) {
      const char =
        findValidCaseCharacter(pin.label) || findValidCaseCharacter(pin.id);
      if (char) {
        const liveChar =
          photosMap.get(`avatar_${char.id}`) || photosMap.get(char.id);
        if (liveChar) return liveChar;
        if (char.avatarUrl) return char.avatarUrl;
      }
    }
  } else {
    const isDefaultCase = !caseId || caseId === "case-000" || caseId === "case_000";
    if (isDefaultCase) {
      const char =
        findValidCaseCharacter(pin.label) || findValidCaseCharacter(pin.id);
      if (char && char.avatarUrl) return char.avatarUrl;
    }
  }

  // 2. Fallback if not found in live Google Sheets
  if (isCrimeScenePin) {
    return "/images/avatar_placeholder.svg";
  }

  return undefined;
};

export const getLoadedImage = (
  rawUrl: string,
  imageCache: Map<string, HTMLImageElement>,
  fallbackUrl?: string,
  onLoaded?: () => void,
): HTMLImageElement | null => {
  if (!rawUrl) {
    return fallbackUrl
      ? getLoadedImage(fallbackUrl, imageCache, undefined, onLoaded)
      : null;
  }
  const url = normalizeImageUrl(rawUrl);
  let img = imageCache.get(url);
  if (!img) {
    img = new Image();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.src = url;
    img.onload = () => {
      if (onLoaded) onLoaded();
    };
    img.onerror = () => {
      console.warn("Failed to load photo asset:", url);
      if (fallbackUrl && fallbackUrl !== url) {
        const fallbackNorm = normalizeImageUrl(fallbackUrl);
        const fallbackImg = getLoadedImage(
          fallbackNorm,
          imageCache,
          undefined,
          onLoaded,
        );
        if (fallbackImg) {
          imageCache.set(url, fallbackImg);
          if (onLoaded) onLoaded();
        }
      }
    };
    imageCache.set(url, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
};

export const getCompositeCard = (
  rawUrl: string,
  label: string,
  imageCache: Map<string, HTMLImageElement>,
  compositeCache: Map<string, HTMLCanvasElement>,
  fallbackUrl?: string,
  onLoaded?: () => void,
): HTMLCanvasElement | HTMLImageElement | null => {
  if (!rawUrl) {
    return fallbackUrl
      ? getLoadedImage(fallbackUrl, imageCache, undefined, onLoaded)
      : null;
  }
  const url = normalizeImageUrl(rawUrl);

  const rawLabel = (label || "NẠN NHÂN").trim();
  let cleanLabel = rawLabel.replace(/^[🔑⚡📝🔴🟢⚪\s]+/, "").trim();
  cleanLabel = cleanLabel
    .replace(
      /^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i,
      "",
    )
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .toUpperCase();
  if (!cleanLabel) cleanLabel = rawLabel.toUpperCase();

  const cacheKey = `${url}::${cleanLabel}`;
  const cached = compositeCache.get(cacheKey);
  if (cached) return cached;

  const rawImg = getLoadedImage(url, imageCache, fallbackUrl, onLoaded);
  if (!rawImg) {
    return fallbackUrl
      ? getLoadedImage(fallbackUrl, imageCache, undefined, onLoaded)
      : null;
  }

  // Build procedural Polaroid card with masking tape and name tag
  try {
    const card = document.createElement("canvas");
    const photoW = 300;
    const photoH = 400;
    const padSide = 16;
    const padTop = 18;
    const padBottom = 58;

    const cardW = photoW + padSide * 2; // 332
    const cardH = photoH + padTop + padBottom; // 476
    card.width = cardW;
    card.height = cardH;

    const ctx = card.getContext("2d");
    if (!ctx) return rawImg;

    // 1. Off-white card stock
    ctx.fillStyle = "#F8F7F3";
    ctx.fillRect(0, 0, cardW, cardH);
    ctx.strokeStyle = "#D2CDC3";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, cardW, cardH);

    // 2. Inner photo with cover crop at exact 3:4
    const photoX = padSide;
    const photoY = padTop;
    const imgW = rawImg.naturalWidth || rawImg.width || 1;
    const imgH = rawImg.naturalHeight || rawImg.height || 1;
    const scale = Math.max(photoW / imgW, photoH / imgH);
    const sw = photoW / scale;
    const sh = photoH / scale;
    const sx = (imgW - sw) / 2;
    const sy = (imgH - sh) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();
    ctx.drawImage(rawImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.strokeRect(photoX, photoY, photoW, photoH);
    ctx.restore();

    // 3. Torn beige masking tape across bottom of photo
    const tapeY = photoY + photoH - 16;
    const tapeH = 54;
    const tapeX1 = 8;
    const tapeX2 = cardW - 8;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tapeX1, tapeY);
    ctx.lineTo(tapeX2, tapeY);

    const rightSteps = 8;
    const rightOffsets = [3, -4, 4, -3, 5, -2, 4, -3];
    for (let i = 0; i < rightSteps; i++) {
      const y = tapeY + ((i + 1) / rightSteps) * tapeH;
      const x = tapeX2 + rightOffsets[i % rightOffsets.length];
      ctx.lineTo(x, y);
    }

    ctx.lineTo(tapeX1, tapeY + tapeH);

    const leftOffsets = [-4, 3, -5, 4, -3, 4, -2, 3];
    for (let i = rightSteps - 1; i >= 0; i--) {
      const y = tapeY + (i / rightSteps) * tapeH;
      const x = tapeX1 + leftOffsets[i % leftOffsets.length];
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = "rgba(235, 218, 185, 0.95)";
    ctx.fill();
    ctx.strokeStyle = "rgba(205, 188, 155, 0.85)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = "rgba(180, 160, 130, 0.25)";
    ctx.beginPath();
    ctx.moveTo(tapeX1 + 10, tapeY + 12);
    ctx.lineTo(tapeX2 - 10, tapeY + 12);
    ctx.moveTo(tapeX1 + 15, tapeY + 38);
    ctx.lineTo(tapeX2 - 15, tapeY + 38);
    ctx.stroke();
    ctx.restore();

    // 4. Bold printed Name on tape
    ctx.save();
    ctx.fillStyle = "rgba(18, 20, 26, 0.96)";
    let fontSize = 23;
    ctx.font = `900 ${fontSize}px Arial, "SF Pro Display", -apple-system, sans-serif`;
    while (ctx.measureText(cleanLabel).width > cardW - 36 && fontSize > 14) {
      fontSize -= 1;
      ctx.font = `900 ${fontSize}px Arial, "SF Pro Display", -apple-system, sans-serif`;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cleanLabel, cardW / 2, tapeY + tapeH / 2 + 1);
    ctx.restore();

    compositeCache.set(cacheKey, card);
    return card;
  } catch (e) {
    console.warn("Failed to generate dynamic composite card:", e);
    return rawImg;
  }
};
