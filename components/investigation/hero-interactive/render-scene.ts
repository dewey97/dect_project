import type {
  CaseConnection,
  CaseData,
  PinPoint,
  Point,
  UserConnection,
  UserPin,
  ViewTransform,
  ZoomState,
} from "./types";
import { BOARD_BASE_WIDTH } from "./constants";
import {
  getInnerBoardBounds,
  getViewTransform,
  screenToWorld,
  wrapText,
} from "./utils";

export type UnifiedPin = PinPoint & {
  isUser?: boolean;
};

export interface RenderSceneParams {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  devicePixelRatio: number;
  boardImage: HTMLImageElement | null;
  boardFrame: HTMLImageElement | null;
  currentCaseId: string;
  activeCase: CaseData;
  customPins?: PinPoint[];
  customConnections?: CaseConnection[];
  userPins: UserPin[];
  userConnections: UserConnection[];
  selectedPinId?: string | null;
  hoveredPinId?: string | null;
  draggingPinId?: string | null;
  connectionStartId?: string | null;
  pointer: { x: number; y: number; active: boolean };
  zoom: ZoomState;
  pan: Point;
  isEditMode: boolean;
  lightConeConfig?: {
    enabled?: boolean;
    intensity?: number;
    coneSpread?: number;
  };
  resolveSuspectPhotoUrl: (
    pin: {
      id: string;
      label: string;
      photoUrl?: string;
    },
    caseId?: string,
  ) => string | undefined;
  getLoadedImage: (
    rawUrl: string,
    fallbackUrl?: string,
  ) => HTMLImageElement | null;
  getCompositeCard: (
    rawUrl: string,
    label: string,
    fallbackUrl?: string,
  ) => HTMLCanvasElement | HTMLImageElement | null;
  timestamp: number;
}

export function renderScene({
  context,
  canvas,
  width,
  height,
  devicePixelRatio,
  boardImage,
  boardFrame,
  currentCaseId,
  activeCase,
  customPins,
  customConnections,
  userPins,
  userConnections,
  selectedPinId,
  hoveredPinId,
  draggingPinId,
  connectionStartId,
  pointer,
  zoom,
  pan,
  isEditMode,
  lightConeConfig,
  resolveSuspectPhotoUrl,
  getLoadedImage,
  getCompositeCard,
  timestamp,
}: RenderSceneParams): void {
  if (width <= 0 || height <= 0) {
    return;
  }

  /*
   * Reset transform trước khi clear để đảm bảo xóa toàn bộ
   * pixel buffer, sau đó đưa context về hệ tọa độ CSS pixel.
   */
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  const image = boardImage;
  const frameImg = boardFrame;

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
  const transform = getViewTransform(zoom, pan);
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
  const casePins = customPins ?? activeCase.pins;
  const uPins = userPins;
  const allPinsUnified: UnifiedPin[] = [
    ...casePins.map((p) => ({
      ...p,
      isUser: false,
    })),
    ...uPins.map((p) => ({
      ...p,
      detail: "",
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

    // Check if this pin is custom vs system pin
    const isCustomPin = Boolean(pin.isCustomNode || pin.isUser);
    const rotationDeg = pin.rotation ?? 0;
    const scaleMod = pin.scale ?? 1.0;

    context.save();
    context.translate(pinPosition.x, pinPosition.y);
    if (rotationDeg !== 0) {
      context.rotate((rotationDeg * Math.PI) / 180);
    }

    // Resolve suspect photo URL using live Google Sheets or case-000 suspects mapping
    const resolvedPhotoUrl = resolveSuspectPhotoUrl(pin, currentCaseId);

    // If pin has a resolved photo URL (Polaroid format for suspects / victims / crime scenes)
    if (resolvedPhotoUrl) {
      const isReinvestigate =
        pin.nodeKind === "reinvestigate" ||
        pin.id.includes("reinvestigate") ||
        (pin.label && pin.label.toLowerCase().includes("khám xét"));
      const isVictimPhone =
        pin.nodeKind === "victim_phone" ||
        (pin.id.includes("phone") &&
          pin.nodeKind !== "phone_lookup" &&
          Boolean(pin.photoUrl));

      let loadedSuspectImg: HTMLCanvasElement | HTMLImageElement | null = null;
      if (isReinvestigate || isVictimPhone) {
        loadedSuspectImg = getLoadedImage(resolvedPhotoUrl);
      } else {
        loadedSuspectImg = getCompositeCard(
          resolvedPhotoUrl,
          pin.label,
          resolvedPhotoUrl,
        );
      }

      if (loadedSuspectImg) {
        const imgW =
          (loadedSuspectImg as HTMLImageElement).naturalWidth ||
          loadedSuspectImg.width ||
          300;
        const imgH =
          (loadedSuspectImg as HTMLImageElement).naturalHeight ||
          loadedSuspectImg.height ||
          380;

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
          (!isVictimPhone &&
            !isReinvestigateProp &&
            Boolean(pin.role === "victim" || (pin.label && pin.label.toLowerCase().includes("nạn nhân"))));
        const isCrimeScene =
          pin.id.includes("crime-scene") ||
          pin.id.includes("thi-the") ||
          (pin.label && pin.label.toLowerCase().includes("thi thể"));
        const baseCardWidth = isVictim
          ? 204
          : isCrimeScene
            ? 186
            : isVictimPhone
              ? 135
              : isReinvestigateProp
                ? 195
                : 158;
        const cardWidth =
          (baseCardWidth * scaleFactor * scaleMod) / transform.scale;
        const cardHeight = (cardWidth * imgH) / imgW;

        const tagX = -cardWidth / 2;
        const tagY = isCrimeScene
          ? -cardHeight * 0.05
          : isVictimPhone
            ? -cardHeight * 0.04
            : isReinvestigateProp
              ? -cardHeight * 0.05
              : -cardHeight * 0.1;

        // Pass 1 — wide ambient occlusion: soft halo lifting the card off the corkboard
        context.save();
        context.shadowColor = "rgba(10, 5, 2, 0.34)";
        context.shadowBlur = (22 * scaleFactor) / transform.scale;
        context.shadowOffsetX = (1.5 * scaleFactor) / transform.scale;
        context.shadowOffsetY = (9 * scaleFactor) / transform.scale;
        context.drawImage(loadedSuspectImg, tagX, tagY, cardWidth, cardHeight);
        context.restore();

        // Pass 2 — tight contact shadow: crisp dark edge right under the paper
        context.save();
        context.shadowColor = "rgba(10, 5, 2, 0.58)";
        context.shadowBlur = (7 * scaleFactor) / transform.scale;
        context.shadowOffsetX = (2.6 * scaleFactor) / transform.scale;
        context.shadowOffsetY = (5.2 * scaleFactor) / transform.scale;

        // Render complete pre-rendered photo card (includes photo, beige tape + name, yellow pin)
        context.drawImage(loadedSuspectImg, tagX, tagY, cardWidth, cardHeight);
        context.restore();
      } else {
        // Lightweight fallback while image is loading
        const isVictim =
          pin.nodeKind === "victim" ||
          Boolean(pin.role === "victim" || (pin.label && pin.label.toLowerCase().includes("nạn nhân")));
        const isCrimeScene =
          pin.id.includes("crime-scene") ||
          pin.id.includes("thi-the") ||
          (pin.label && pin.label.toLowerCase().includes("thi thể"));
        const baseCardWidth = isVictim ? 204 : isCrimeScene ? 186 : 158;
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
      const isPhotoHovered = hoveredPinId === pin.id;
      const isPhotoSelected = selectedPinId === pin.id;
      if (isPhotoHovered || isPhotoSelected) {
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
          (!isVictimPhone &&
            !isReinvestigateProp &&
            Boolean(pin.role === "victim" || (pin.label && pin.label.toLowerCase().includes("nạn nhân"))));
        const isCrimeScene =
          pin.id.includes("crime-scene") ||
          pin.id.includes("thi-the") ||
          (pin.label && pin.label.toLowerCase().includes("thi thể"));
        const baseCardWidth = isVictim
          ? 204
          : isCrimeScene
            ? 186
            : isVictimPhone
              ? 135
              : isReinvestigateProp
                ? 195
                : 158;
        const cardWidth =
          (baseCardWidth * scaleFactor * scaleMod) / transform.scale;
        const cardHeight = loadedSuspectImg
          ? (cardWidth *
              ((loadedSuspectImg as HTMLImageElement).naturalHeight ||
                loadedSuspectImg.height ||
                380)) /
            ((loadedSuspectImg as HTMLImageElement).naturalWidth ||
              loadedSuspectImg.width ||
              300)
          : cardWidth * 1.3;
        const tagX = -cardWidth / 2;
        const tagY = isCrimeScene
          ? -cardHeight * 0.05
          : isVictimPhone
            ? -cardHeight * 0.04
            : isReinvestigateProp
              ? -cardHeight * 0.05
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

        if (isEditMode) {
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
        pin.noteColor === "white" ||
        upperLabel.includes("MỞ RỘNG") ||
        upperLabel.includes("KHÁM XÉT") ||
        upperLabel.includes("KHÁM NGHIỆM") ||
        upperLabel.includes("KẾT LUẬN") ||
        upperLabel.includes("BIÊN BẢN") ||
        upperLabel.includes("TRUY TỐ");

      let noteUrl = "";
      let isPreRendered = false;

      const customTextureUrl = pin.noteTextureUrl as string | undefined;

      if (customTextureUrl) {
        noteUrl = customTextureUrl;
        isPreRendered =
          customTextureUrl.includes("rendered_notes/") ||
          customTextureUrl.includes("/notes/");
      } else if (
        pin.nodeKind === "evidence_hub" ||
        upperLabel.includes("CHỨNG CỨ")
      ) {
        noteUrl = "/images/board/notes/note_bo_sung_chung_cu.png";
        isPreRendered = true;
      } else if (
        pin.nodeKind === "suspects_hub" ||
        upperLabel.includes("NGHI PHẠM")
      ) {
        noteUrl = "/images/board/notes/note_nghi_pham.png";
        isPreRendered = true;
      } else if (
        pin.nodeKind === "followup" ||
        pin.id.startsWith("followup-") ||
        upperLabel.includes("NGHI VẤN") ||
        upperLabel.includes("CÂU HỎI")
      ) {
        noteUrl = "/images/board/notes/note_nghi_van.png";
        isPreRendered = true;
      } else if (
        pin.nodeKind === "phone_lookup" ||
        upperLabel.includes("MỞ RỘNG")
      ) {
        noteUrl = "/images/board/notes/note_mo_rong_dieu_tra.png";
        isPreRendered = true;
      } else if (
        pin.nodeKind === "reinvestigate" ||
        upperLabel.includes("KHÁM XÉT") ||
        upperLabel.includes("KHÁM NGHIỆM")
      ) {
        noteUrl = "/images/board/notes/note_kham_xet_lai.png";
        isPreRendered = true;
      } else if (
        pin.nodeKind === "indictment" ||
        upperLabel.includes("KẾT LUẬN") ||
        upperLabel.includes("TRUY TỐ")
      ) {
        noteUrl = "/images/board/notes/note_ket_luan_dieu_tra.png";
        isPreRendered = true;
      } else if (isWhiteNote) {
        noteUrl = "/images/board/notes/note_mo_rong_dieu_tra.png";
        isPreRendered = false;
      } else {
        noteUrl = "/images/board/notes/note_nghi_van.png";
        isPreRendered = false;
      }

      const loadedNoteImg = getLoadedImage(noteUrl);

      const isIndictment =
        pin.nodeKind === "indictment" ||
        upperLabel.includes("KẾT LUẬN");
      const isFollowup =
        pin.nodeKind === "followup" ||
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
        noteHeight = noteWidth * (isFollowup ? 0.92 : isWhiteNote ? 1.18 : 1.0);
      }

      let pinAnchorX = 0.5;
      let pinAnchorY = 0.08;

      if (
        pin.nodeKind === "evidence_hub" ||
        upperLabel.includes("CHỨNG CỨ")
      ) {
        pinAnchorX = 0.5;
        pinAnchorY = 0.08;
      } else if (
        pin.nodeKind === "suspects_hub" ||
        upperLabel.includes("NGHI PHẠM")
      ) {
        pinAnchorX = 0.5;
        pinAnchorY = 0.08;
      } else if (
        pin.nodeKind === "followup" ||
        pin.id.startsWith("followup-") ||
        upperLabel.includes("NGHI VẤN") ||
        upperLabel.includes("CÂU HỎI")
      ) {
        pinAnchorX = 0.5;
        pinAnchorY = 0.08;
      } else if (
        pin.nodeKind === "phone_lookup" ||
        upperLabel.includes("MỞ RỘNG")
      ) {
        pinAnchorX = 0.5;
        pinAnchorY = 0.075;
      } else if (
        pin.nodeKind === "reinvestigate" ||
        upperLabel.includes("KHÁM XÉT") ||
        upperLabel.includes("KHÁM NGHIỆM")
      ) {
        pinAnchorX = 0.5;
        pinAnchorY = 0.075;
      } else if (
        pin.nodeKind === "indictment" ||
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
      if (pin.pulseBorder) {
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
      const isNoteHovered = hoveredPinId === pin.id;
      const isNoteSelected = selectedPinId === pin.id;

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

        if (isEditMode) {
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
            lines.length * ((fontSize + 1.5 * scaleFactor) / transform.scale) >
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
        pin.nodeKind === "phone_lookup" ||
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

    // Pinhole puncture (Skip for physical evidence props which already have realistic self-contained shadows & pins)
    const isSelfContainedProp =
      pin.nodeKind === "victim_phone" ||
      pin.nodeKind === "reinvestigate" ||
      pin.id.includes("reinvestigate") ||
      Boolean(
        pin.photoUrl &&
        (pin.photoUrl.includes("crime_scene") ||
          pin.photoUrl.includes("reinvestigation")),
      );
    if (!isSelfContainedProp) {
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
  const caseConns = customConnections ?? activeCase.connections;
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
  userConnections.forEach((conn) => {
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
  if (connectionStartId && pointer.active) {
    const start = pinPositionsMap.get(connectionStartId);
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
    if (
      pin.nodeKind === "victim_phone" ||
      pin.nodeKind === "reinvestigate" ||
      pin.id.includes("reinvestigate") ||
      Boolean(
        pin.photoUrl &&
        (pin.photoUrl.includes("crime_scene") ||
          pin.photoUrl.includes("reinvestigation")),
      )
    ) {
      return; // Self-contained physical evidence items, no overlay pushpin
    }

    const isEvidencePin =
      pin.nodeKind === "evidence_hub" ||
      pin.nodeKind === "photo" ||
      (pin.label && pin.label.toLowerCase().includes("bổ sung chứng cứ"));
    const isSuspectPin =
      pin.nodeKind === "suspect" ||
      pin.nodeKind === "suspects_hub" ||
      pin.nodeKind === "victim" ||
      pin.id.includes("suspect") ||
      (pin.label && pin.label.toLowerCase().includes("nghi phạm"));
    const isIndictmentPin =
      pin.nodeKind === "indictment" ||
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
      const drawX = pinPosition.x - pinDisplayWidth * (isFlipped ? 0.49 : 0.51);
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
  // 4. Draw Atmospheric Spotlight Cone DIRECTLY on Corkboard Surface
  // (Constrained to board bounds - ZERO light spill outside)
  // ──────────────────────────────────
  const lightConfig = lightConeConfig;
  if (lightConfig?.enabled) {
    context.save();
    // Clip exact inner board rectangle so light never spills onto the surrounding desk
    context.beginPath();
    context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.clip();

    const intensity = (lightConfig.intensity ?? 85) / 100;
    const spreadRatio = (lightConfig.coneSpread ?? 65) / 100;
    const centerX = bounds.x + bounds.width * 0.5;
    const topY = bounds.y;

    // Conic-like triangular spotlight beam from top center
    const beamHalfWidth =
      bounds.width * 0.5 * spreadRatio + bounds.width * 0.15;
    const beamGrad = context.createLinearGradient(
      centerX,
      topY,
      centerX,
      bounds.y + bounds.height,
    );
    beamGrad.addColorStop(0, `rgba(255, 245, 210, ${0.4 * intensity})`);
    beamGrad.addColorStop(0.35, `rgba(255, 230, 160, ${0.2 * intensity})`);
    beamGrad.addColorStop(0.75, `rgba(180, 120, 60, ${0.08 * intensity})`);
    beamGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.save();
    context.globalCompositeOperation = "screen";
    context.fillStyle = beamGrad;
    context.beginPath();
    context.moveTo(centerX, topY);
    context.lineTo(centerX + beamHalfWidth, bounds.y + bounds.height);
    context.lineTo(centerX - beamHalfWidth, bounds.y + bounds.height);
    context.closePath();
    context.fill();
    context.restore();

    // Soft radial ambient glow right at the lamp fixture
    const lampGlow = context.createRadialGradient(
      centerX,
      topY,
      bounds.width * 0.02,
      centerX,
      topY + bounds.height * 0.25,
      bounds.width * 0.55 * spreadRatio,
    );
    lampGlow.addColorStop(0, `rgba(255, 255, 235, ${0.45 * intensity})`);
    lampGlow.addColorStop(0.3, `rgba(255, 225, 150, ${0.22 * intensity})`);
    lampGlow.addColorStop(0.7, `rgba(140, 70, 20, ${0.06 * intensity})`);
    lampGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.save();
    context.globalCompositeOperation = "screen";
    context.fillStyle = lampGlow;
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.restore();

    // Edge vignette: darken bottom and corners of the corkboard naturally
    const edgeVignette = context.createRadialGradient(
      centerX,
      bounds.y + bounds.height * 0.35,
      bounds.width * 0.25,
      centerX,
      bounds.y + bounds.height * 0.5,
      bounds.width * 0.72,
    );
    edgeVignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    edgeVignette.addColorStop(0.65, "rgba(10, 5, 2, 0.25)");
    edgeVignette.addColorStop(1, `rgba(5, 2, 1, ${0.6 * intensity})`);

    context.save();
    context.globalCompositeOperation = "multiply";
    context.fillStyle = edgeVignette;
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.restore();

    context.restore();
  }
}
