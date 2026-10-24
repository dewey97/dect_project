"use client";

import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import {
  getCanonicalSuspectKey,
  removeDiacritics,
} from "@/lib/cases/case-000-suspects";
import { normalizeImageUrl } from "@/lib/utils";
import { normalizeCaseId } from "@/lib/cases/case-id";
import type { DbCaseBoardNode, DbCaseCharacter } from "@/lib/types/database";
import type { Checkpoint } from "@/lib/types";
import type { SuspectItem } from "./use-investigation-state";

/**
 * Tính vị trí lưới xác định (lưới theo slot_index) khi thiếu tọa độ tùy chỉnh.
 * Phân bố đều trong khoảng an toàn [0.1, 0.9] của bàn điều tra.
 */
export function computeDeterministicGridPosition(
  slotIndex: number,
  isMobile = false,
): { x: number; y: number } {
  const cols = isMobile ? 3 : 4;
  const col = slotIndex % cols;
  const row = Math.floor(slotIndex / cols);

  const startX = isMobile ? 0.2 : 0.24;
  const stepX = isMobile ? 0.28 : 0.2;
  const startY = isMobile ? 0.24 : 0.28;
  const stepY = isMobile ? 0.22 : 0.22;

  const x = Number(
    Math.min(Math.max(startX + col * stepX, 0.12), 0.88).toFixed(3),
  );
  const y = Number(
    Math.min(Math.max(startY + row * stepY, 0.14), 0.88).toFixed(3),
  );

  return { x, y };
}

export type SheetPinnedItem = {
  code?: string | null;
  photo_code?: string | null;
  label?: string | null;
  title?: string | null;
  drive_url?: string | null;
  direct_cdn_url?: string | null;
  url?: string | null;
  description?: string | null;
  category?: string | null;
  board_x?: string | number | null;
  board_y?: string | number | null;
};

export type PinBuilderInput = {
  isMobile: boolean;
  caseId?: string;
  caseSlug?: string;
  characters?: DbCaseCharacter[];
  checkpoints?: Checkpoint[];
  boardNodes?: DbCaseBoardNode[];
  evidence?: SheetPinnedItem[];
  positions?: Record<string, { x: number; y: number }>;

  // Tương thích ngược với các caller hiện tại (main-investigation-canvas):
  effectiveSuspects?: SuspectItem[];
  sheetPhotoMap?: Record<string, string>;
  sheetPinnedItems?: SheetPinnedItem[];
  followupCulpritIds?: string[];
  effectiveReinvestigateUnlocked?: boolean;
  effectivePhoneSolved?: boolean;
  effectiveIndictmentSolved?: boolean;
  isReinvestigateBlinking?: boolean;
  caseCheckpoints?:
    | Checkpoint[]
    | Array<{
        id: string;
        title?: string;
        question?: string;
        [key: string]: unknown;
      }>;
  victimName?: string;
};

/**
 * Trợ giúp lấy vị trí theo thứ tự ưu tiên:
 * 1. positions (boardgame_pins / kéo tay)
 * 2. config.position (desktop / mobile)
 * 3. Lưới tự tính theo slotIndex
 */
function resolveNodePosition(
  primaryId: string,
  legacyId: string | undefined,
  configPosition:
    | { desktop?: { x: number; y: number }; mobile?: { x: number; y: number } }
    | undefined,
  slotIndex: number,
  isMobile: boolean,
  positions: Record<string, { x: number; y: number }> | undefined,
  hardcodedDefault?: { x: number; y: number },
): { x: number; y: number } {
  if (positions) {
    if (positions[primaryId]) return positions[primaryId];
    if (legacyId && positions[legacyId]) return positions[legacyId];
  }

  const explicit = isMobile ? configPosition?.mobile : configPosition?.desktop;
  if (
    explicit &&
    typeof explicit.x === "number" &&
    typeof explicit.y === "number"
  ) {
    return { x: explicit.x, y: explicit.y };
  }

  if (hardcodedDefault) {
    return hardcodedDefault;
  }

  return computeDeterministicGridPosition(slotIndex, isMobile);
}

/**
 * Dựng danh sách toàn bộ các node (PinPoint) trên bảng điều tra từ dữ liệu.
 */
export function buildCustomPins(input: PinBuilderInput): PinPoint[] {
  const caseSlug = normalizeCaseId(
    input.caseSlug || input.caseId || "case_000",
  );
  const isCase000 = caseSlug === "case_000";
  const isMobile = input.isMobile;
  const positions = input.positions;

  const pins: PinPoint[] = [];

  // ============================================================================
  // 1. BOARD NODES (Node hệ thống & Ghim cố định)
  // ============================================================================
  const hasDbBoardNodes = Boolean(
    input.boardNodes && input.boardNodes.length > 0,
  );

  if (hasDbBoardNodes && input.boardNodes) {
    input.boardNodes.forEach((node) => {
      const legacyId = isCase000
        ? node.node_kind === "victim_phone"
          ? "c0-pin-victim-phone"
          : node.node_kind === "reinvestigate"
            ? "c0-pin-reinvestigate"
            : node.node_kind === "suspects_hub"
              ? "c0-pin-suspects"
              : undefined
        : undefined;

      const pos = resolveNodePosition(
        node.id,
        legacyId,
        node.config?.position,
        node.slot_index,
        isMobile,
        positions,
      );

      pins.push({
        id: node.id,
        nodeKind: node.node_kind,
        subjectKey: node.subject_key || undefined,
        checkpointId: node.checkpoint_id || undefined,
        legacyId,
        x: pos.x,
        y: pos.y,
        label: node.title || node.config?.pin_title || node.node_kind,
        detail: node.title ? `Vật chứng / Khu vực: ${node.title}` : "",
        photoUrl: node.config?.photo_url || undefined,
        noteTextureUrl: undefined,
        isAvatar: node.node_kind === "victim",
        color: (node.config?.note_style as PinPoint["color"]) || "yellow",
        actionType: "info",
      });
    });
  } else {
    // Fallback an toàn: Dựng 5 node cơ bản khi database chưa chạy migration 39
    const victimName = input.victimName || "Nạn nhân";

    // 1.1. victim_phone
    const vpId = `${caseSlug}:victim_phone:item`;
    const vpPos = resolveNodePosition(
      vpId,
      "c0-pin-victim-phone",
      undefined,
      1,
      isMobile,
      positions,
      { x: 0.38, y: 0.14 },
    );
    pins.push({
      id: vpId,
      nodeKind: "victim_phone",
      legacyId: "c0-pin-victim-phone",
      x: vpPos.x,
      y: vpPos.y,
      label: "Điện thoại nạn nhân",
      detail: `Vật chứng: Điện thoại thu giữ của nạn nhân ${victimName}`,
      color: "yellow",
      pinColor: "yellow",
      photoUrl: "/phone.png",
      scale: 0.85,
    });

    // 1.2. reinvestigate
    const reinvId = `${caseSlug}:reinvestigate:scene`;
    const reinvPos = resolveNodePosition(
      reinvId,
      "c0-pin-reinvestigate",
      undefined,
      2,
      isMobile,
      positions,
      { x: 0.18, y: 0.36 },
    );
    const crimeScenePhotoUrl = isCase000
      ? "/images/cases/case_000/crime_scene.png"
      : `/images/cases/${caseSlug}/crime_scene.png`;
    pins.push({
      id: reinvId,
      nodeKind: "reinvestigate",
      legacyId: "c0-pin-reinvestigate",
      x: reinvPos.x,
      y: reinvPos.y,
      label: "Khám xét hiện trường",
      detail: isCase000
        ? "Mở biên bản và rà soát toàn cảnh 360 hiện trường số 14 Đường Bờ Sông"
        : "Mở biên bản và rà soát toàn cảnh 360 hiện trường vụ án",
      color: "yellow",
      pinColor: "yellow",
      noteColor: "white",
      photoUrl: crimeScenePhotoUrl,
      scale: 0.95,
      pulseBorder: input.isReinvestigateBlinking,
      isLocked: false,
      actionType: "info",
    });

    // 1.3. suspects_hub
    const shId = `${caseSlug}:suspects_hub:hub`;
    const shPos = resolveNodePosition(
      shId,
      "c0-pin-suspects",
      undefined,
      3,
      isMobile,
      positions,
      { x: 0.58, y: 0.38 },
    );
    pins.push({
      id: shId,
      nodeKind: "suspects_hub",
      legacyId: "c0-pin-suspects",
      x: shPos.x,
      y: shPos.y,
      label: "Nghi phạm",
      detail: "Thêm & xem danh sách nghi phạm vụ án",
      color: isMobile ? "yellow" : "red",
      pinColor: isMobile ? "yellow" : "red",
      noteColor: "yellow",
    });
  }

  // ============================================================================
  // 2. CHECKPOINTS (phone_lookup, indictment, followup)
  // ============================================================================
  const allCheckpoints = (input.checkpoints ||
    input.caseCheckpoints ||
    []) as Array<{
    id: string;
    kind?: string;
    title?: string;
    subjectKey?: string;
    subject_key?: string;
    boardConfig?: {
      pin_title?: string;
      position?: {
        desktop?: { x: number; y: number };
        mobile?: { x: number; y: number };
      };
    };
    board_config?: {
      pin_title?: string;
      position?: {
        desktop?: { x: number; y: number };
        mobile?: { x: number; y: number };
      };
    };
    [key: string]: unknown;
  }>;

  // 2.1. Checkpoint: phone_lookup
  const phoneCp = allCheckpoints.find(
    (cp) =>
      cp.kind === "phone_lookup" ||
      cp.id.includes("phone") ||
      cp.id.includes("-0"),
  );
  const phoneCpId = phoneCp?.id;
  const phoneNodeId = `${caseSlug}:phone_lookup:${phoneCpId || "system"}`;
  const phoneBoardCfg = phoneCp?.boardConfig || phoneCp?.board_config;
  const phonePos = resolveNodePosition(
    phoneNodeId,
    "c0-pin-phone",
    phoneBoardCfg?.position,
    0,
    isMobile,
    positions,
    { x: 0.42, y: 0.27 },
  );
  const victimName = input.victimName || "Nạn nhân";
  const phoneDetail = input.effectivePhoneSolved
    ? "Đã xác minh danh tính SĐT thành công"
    : `Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân ${victimName}`;

  pins.push({
    id: phoneNodeId,
    nodeKind: "phone_lookup",
    checkpointId: phoneCpId,
    legacyId: "c0-pin-phone",
    x: phonePos.x,
    y: phonePos.y,
    label: phoneBoardCfg?.pin_title || "Mở rộng điều tra",
    detail: phoneDetail,
    color: input.effectivePhoneSolved ? "cyan" : "yellow",
    pinColor: input.effectivePhoneSolved ? "cyan" : "yellow",
    noteColor: "white",
    isSolved: input.effectivePhoneSolved,
    actionType: phoneCpId ? "sheet_checkpoint" : "info",
  });

  // 2.2. Checkpoint: indictment
  const indictmentCp = allCheckpoints.find(
    (cp) =>
      cp.kind === "indictment" ||
      cp.id.includes("indictment") ||
      cp.id.includes("-2b"),
  );
  const indictmentCpId = indictmentCp?.id;
  const indictmentNodeId = `${caseSlug}:indictment:${indictmentCpId || "verdict"}`;
  const indictmentBoardCfg =
    indictmentCp?.boardConfig || indictmentCp?.board_config;
  const indictmentPos = resolveNodePosition(
    indictmentNodeId,
    "c0-pin-indictment",
    indictmentBoardCfg?.position,
    4,
    isMobile,
    positions,
    { x: 0.22, y: 0.8 },
  );
  pins.push({
    id: indictmentNodeId,
    nodeKind: "indictment",
    checkpointId: indictmentCpId,
    legacyId: "c0-pin-indictment",
    x: indictmentPos.x,
    y: indictmentPos.y,
    label: indictmentBoardCfg?.pin_title || "Bản kết luận điều tra",
    detail: input.effectiveIndictmentSolved
      ? "Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!"
      : "Lập bản cáo trạng gửi Viện Kiểm sát",
    color: "red",
    pinColor: "red",
    noteColor: "white",
    isSolved: input.effectiveIndictmentSolved,
    actionType: indictmentCpId ? "sheet_checkpoint" : "info",
  });

  // ============================================================================
  // 3. SUSPECTS (Nhân vật nghi phạm)
  // ============================================================================
  const effectiveSuspects = input.effectiveSuspects || [];
  const characters = input.characters || [];

  // Gom danh sách nghi phạm hợp nhất (ưu tiên characters context có avatar_url)
  const suspectsList = effectiveSuspects.map((s, idx) => {
    const { canonicalId, canonicalName, photoUrl, slotIndex } =
      getCanonicalSuspectKey(s);
    const char = characters.find(
      (c) =>
        c.key === canonicalId ||
        (s.id && c.key === s.id.toLowerCase()) ||
        removeDiacritics(c.name || "") === removeDiacritics(s.name || ""),
    );

    return {
      key: canonicalId,
      name: canonicalName || char?.name || s.name,
      avatarUrl:
        char?.avatar_url ||
        (char as unknown as { avatarUrl?: string })?.avatarUrl ||
        photoUrl,
      slotIndex: typeof slotIndex === "number" ? slotIndex : idx,
      clueCount: s.clueIds ? s.clueIds.length : 0,
      originalSuspect: s,
    };
  });

  // Tọa độ chuẩn 3 nghi phạm chính của case_000 nếu chưa kéo tay
  const c0DefaultSuspectCoords: Record<string, { x: number; y: number }> = {
    vu: { x: 0.44, y: 0.58 },
    tung: { x: 0.6, y: 0.54 },
    ha: { x: 0.76, y: 0.62 },
  };

  suspectsList.forEach((s) => {
    const primaryId = `${caseSlug}:suspect:${s.key}`;
    const legacyId = `node-suspect-${s.key}`;

    // Tìm checkpoint thẩm tra tương ứng
    const matchCp = allCheckpoints.find((cp) => {
      const sKey = (cp.subjectKey || cp.subject_key || "").trim().toLowerCase();
      if (sKey && sKey === s.key) return true;
      const titleClean = removeDiacritics(cp.title || "").toLowerCase();
      const sNameClean = removeDiacritics(s.name || "").toLowerCase();
      return titleClean.includes(s.key) || titleClean.includes(sNameClean);
    });

    const fallbackCoord =
      isCase000 && c0DefaultSuspectCoords[s.key]
        ? c0DefaultSuspectCoords[s.key]
        : undefined;

    const pos = resolveNodePosition(
      primaryId,
      legacyId,
      undefined,
      s.slotIndex,
      isMobile,
      positions,
      fallbackCoord,
    );

    pins.push({
      id: primaryId,
      nodeKind: "suspect",
      subjectKey: s.key,
      legacyId,
      checkpointId: matchCp?.id,
      x: pos.x,
      y: pos.y,
      label: s.name,
      detail: `Nghi phạm: ${s.name} (${s.clueCount} manh mối liên quan)`,
      color: "blue",
      photoUrl:
        s.avatarUrl ||
        input.sheetPhotoMap?.[s.key] ||
        "/images/avatar_placeholder.svg",
      isAvatar: true,
      actionType: matchCp?.id ? "sheet_checkpoint" : "info",
    });
  });

  // ============================================================================
  // 4. FOLLOWUP PINS (Ghim Nghi vấn mở rộng)
  // ============================================================================
  const activeFollowupSet = new Set<string>(input.followupCulpritIds || []);

  const c0DefaultFollowupCoords: Record<string, { x: number; y: number }> = {
    vu: { x: 0.44, y: 0.82 },
    tung: { x: 0.6, y: 0.75 },
    ha: { x: 0.76, y: 0.77 },
  };

  suspectsList.forEach((s) => {
    if (!activeFollowupSet.has(s.key)) return;

    // Tìm checkpoint followup
    const matchCp = allCheckpoints.find((cp) => {
      const isFollowup =
        cp.kind === "followup" ||
        cp.id.toLowerCase().includes("followup") ||
        (cp.followupOf && String(cp.followupOf).toLowerCase().includes(s.key));
      if (!isFollowup) return false;

      const sKey = (cp.subjectKey || cp.subject_key || "").trim().toLowerCase();
      if (sKey === s.key) return true;
      const titleClean = removeDiacritics(cp.title || "").toLowerCase();
      const sNameClean = removeDiacritics(s.name || "").toLowerCase();
      return titleClean.includes(s.key) || titleClean.includes(sNameClean);
    });

    if (!matchCp) return;

    const primaryId = `${caseSlug}:followup:${s.key}`;
    const legacyId = `c0-pin-followup-${s.key}`;
    const boardCfg = matchCp.boardConfig || matchCp.board_config;

    const suspectPin = pins.find(
      (p) => p.nodeKind === "suspect" && p.subjectKey === s.key,
    );
    const fallbackCoord =
      isCase000 && c0DefaultFollowupCoords[s.key]
        ? c0DefaultFollowupCoords[s.key]
        : suspectPin
          ? { x: suspectPin.x, y: Math.min(suspectPin.y + 0.22, 0.88) }
          : undefined;

    const pos = resolveNodePosition(
      primaryId,
      legacyId,
      boardCfg?.position,
      s.slotIndex + 8,
      isMobile,
      positions,
      fallbackCoord,
    );

    pins.push({
      id: primaryId,
      nodeKind: "followup",
      subjectKey: s.key,
      checkpointId: matchCp.id,
      legacyId,
      x: pos.x,
      y: pos.y,
      label: boardCfg?.pin_title || "Nghi vấn",
      detail: `Nghi vấn suy luận mở rộng đối tượng ${s.name}`,
      color: "purple",
      noteColor: "yellow",
      actionType: "sheet_checkpoint",
    });
  });

  // ============================================================================
  // 5. EVIDENCE & PHOTO PINS (Vật chứng / Ảnh động)
  // ============================================================================
  const pinnedItems = input.evidence || input.sheetPinnedItems || [];
  pinnedItems.forEach((item, idx) => {
    const rawCode = (item.code || item.photo_code || `ev_${idx}`).trim();
    const codeLower = rawCode.toLowerCase();
    const primaryId = `${caseSlug}:evidence:${codeLower}`;
    const legacyId = `c0-pin-evidence-${codeLower}`;

    const rawX =
      typeof item.board_x === "number"
        ? item.board_x
        : parseFloat(String(item.board_x || ""));
    const rawY =
      typeof item.board_y === "number"
        ? item.board_y
        : parseFloat(String(item.board_y || ""));
    const hasCustomCoords =
      !isNaN(rawX) && !isNaN(rawY) && rawX > 0 && rawY > 0;

    let posX = rawX;
    let posY = rawY;
    if (!hasCustomCoords) {
      const grid = computeDeterministicGridPosition(idx + 8, isMobile);
      posX = grid.x;
      posY = grid.y;
    }

    if (positions) {
      if (positions[primaryId]) {
        posX = positions[primaryId].x;
        posY = positions[primaryId].y;
      } else if (positions[legacyId]) {
        posX = positions[legacyId].x;
        posY = positions[legacyId].y;
      }
    }

    const rawUrl = item.drive_url || item.direct_cdn_url || item.url || "";
    const fallbackPhoto =
      input.sheetPhotoMap?.[codeLower.replace(/^avatar_/, "")] ||
      input.sheetPhotoMap?.[codeLower];
    const photoUrl = rawUrl
      ? normalizeImageUrl(rawUrl)
      : fallbackPhoto || "/images/avatar_placeholder.svg";

    const rawCategory = String(item.category || "")
      .toUpperCase()
      .trim();
    const rawLabel = String(item.label || item.title || "")
      .toLowerCase()
      .trim();
    const isAvatar =
      rawCategory === "AVATAR" ||
      codeLower.startsWith("avatar_") ||
      rawLabel.includes("ảnh chân dung") ||
      rawLabel.includes("chân dung");

    pins.push({
      id: primaryId,
      nodeKind: isAvatar ? "photo" : "photo",
      legacyId,
      x: posX,
      y: posY,
      label: item.label || item.title || rawCode || "Vật chứng",
      detail: item.description || `Vật chứng vụ án: ${item.label || rawCode}`,
      color: "yellow",
      photoUrl,
      isAvatar,
      actionType: "info",
    });
  });

  return pins;
}

/**
 * Nối các đường chỉ đỏ tự động giữa các node:
 * - Hub nghi phạm -> các nghi phạm
 * - Nghi phạm -> ghim Nghi vấn của nghi phạm đó
 */
export function buildCustomConnections(opts: {
  effectiveSuspects: SuspectItem[];
  followupCulpritIds?: string[];
  vuSuspect?: SuspectItem;
  tungSuspect?: SuspectItem;
  haSuspect?: SuspectItem;
  activePins?: PinPoint[];
  adminConnections: CaseConnection[];
}): CaseConnection[] {
  const activeFollowupSet = new Set<string>(opts.followupCulpritIds || []);

  const conns: CaseConnection[] = [];

  const findPin = (predicate: (p: PinPoint) => boolean) => {
    return opts.activePins?.find(predicate);
  };

  // Xác định node suspects_hub
  const hubPin = findPin(
    (p) => p.nodeKind === "suspects_hub" || p.id.includes("suspects"),
  );

  opts.effectiveSuspects.forEach((suspect) => {
    const { canonicalId } = getCanonicalSuspectKey(suspect);

    // Tìm suspect pin theo nodeKind + subjectKey hoặc ID
    const sPin = findPin(
      (p) =>
        (p.nodeKind === "suspect" && p.subjectKey === canonicalId) ||
        p.id === `node-suspect-${canonicalId}` ||
        p.legacyId === `node-suspect-${canonicalId}`,
    );

    if (hubPin && sPin) {
      conns.push({
        id: `conn-hub-to-${canonicalId}`,
        fromPinId: hubPin.id,
        toPinId: sPin.id,
      });
    }

    // Nối từ suspect pin sang followup pin nếu có
    if (activeFollowupSet.has(canonicalId) && sPin) {
      const fPin = findPin(
        (p) =>
          (p.nodeKind === "followup" && p.subjectKey === canonicalId) ||
          p.id.includes(`followup-${canonicalId}`) ||
          p.legacyId === `c0-pin-followup-${canonicalId}`,
      );
      if (fPin) {
        conns.push({
          id: `conn-followup-${canonicalId}`,
          fromPinId: sPin.id,
          toPinId: fPin.id,
        });
      }
    }
  });

  return [...conns, ...opts.adminConnections];
}

/**
 * Áp dụng các thay đổi vị trí kéo thả và transform (xoay, tỉ lệ)
 */
export function applyLayoutOverrides(
  customPins: PinPoint[],
  adminCustomPins: PinPoint[],
  customPinPositions: Record<string, { x: number; y: number }>,
  pinTransforms: Record<string, { rotation: number; scale: number }>,
): PinPoint[] {
  return [...customPins, ...adminCustomPins].map((pin) => {
    const override =
      customPinPositions[pin.id] ||
      (pin.legacyId ? customPinPositions[pin.legacyId] : undefined);
    const tf =
      pinTransforms[pin.id] ||
      (pin.legacyId ? pinTransforms[pin.legacyId] : undefined);

    return {
      ...pin,
      ...(override ? { x: override.x, y: override.y } : {}),
      rotation: tf?.rotation !== undefined ? tf.rotation : pin.rotation,
      scale: tf?.scale !== undefined ? tf.scale : pin.scale,
    };
  });
}

/**
 * Trích xuất mã đối tượng tình nghi từ id hoặc detail ghim Nghi vấn.
 */
export function findFollowupCulprit(
  pinId: string,
  detail?: string,
  subjectKey?: string,
): string {
  if (subjectKey) return subjectKey;
  const id = pinId || "";

  // Chuẩn ID mới: case_slug:followup:key
  const parts = id.split(":");
  if (parts.length >= 3 && parts[1] === "followup") {
    return parts[2];
  }

  if (id.startsWith("c0-pin-followup-")) {
    return id.replace("c0-pin-followup-", "");
  }
  if (id.startsWith("followup-")) {
    return id.replace("followup-", "");
  }

  const d = (detail || "").toLowerCase();
  if (id.includes("ha") || d.includes("hà")) return "ha";
  if (id.includes("tung") || d.includes("tùng")) return "tung";
  if (id.includes("vu") || d.includes("vũ")) return "vu";
  return id || "vu";
}

/**
 * Xác định ID Checkpoint tương ứng của một Ghim.
 */
export function detectCheckpointForPin(pin?: PinPoint): string | null {
  if (!pin) return null;
  if (pin.checkpointId) return pin.checkpointId;

  const id = pin.id || "";
  const parts = id.split(":");
  if (parts.length >= 3 && parts[1] === "followup") {
    return `cp-${parts[2]}-followup`;
  }
  if (id.startsWith("c0-pin-followup-")) {
    return `cp-${id.replace("c0-pin-followup-", "")}-followup`;
  }

  return null;
}
