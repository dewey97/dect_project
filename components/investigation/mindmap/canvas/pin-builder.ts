"use client";

import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import {
  getCanonicalSuspectKey,
  removeDiacritics,
} from "@/lib/cases/characters";
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
  isStudioMode?: boolean;
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
    // legacyId positions check removed
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
    const victimName = input.victimName || "Nạn nhân";

    input.boardNodes.forEach((node) => {
      const cfg = (node.config as any) || {};
      const pos = resolveNodePosition(
        node.id,
        cfg.position,
        node.slot_index,
        isMobile,
        positions,
      );

      let detail = node.title ? `Vật chứng / Khu vực: ${node.title}` : "";
      let photoUrl = cfg.photo_url || undefined;
      let scale =
        typeof cfg.scale === "number" && cfg.scale > 0 ? cfg.scale : 1.0;
      const rotation = typeof cfg.rotation === "number" ? cfg.rotation : 0;
      let color = (cfg.note_style as PinPoint["color"]) || "yellow";
      let pinColor: PinPoint["pinColor"] = "yellow";
      let noteColor: PinPoint["noteColor"] = cfg.note_style ? "white" : undefined;
      let pulseBorder: boolean | undefined = undefined;

      if (node.node_kind === "victim_phone") {
        detail = `Vật chứng: Điện thoại thu giữ của nạn nhân ${victimName}`;
        if (!photoUrl) photoUrl = "/phone.png";
        if (typeof cfg.scale !== "number") scale = 0.85;
      } else if (node.node_kind === "reinvestigate") {
        detail = "Mở biên bản và rà soát toàn cảnh 360 hiện trường vụ án";
        if (!photoUrl) photoUrl = `/images/cases/${caseSlug}/crime_scene.png`;
        if (typeof cfg.scale !== "number") scale = 0.95;
        noteColor = "white";
        pulseBorder = input.isReinvestigateBlinking;
      } else if (node.node_kind === "suspects_hub") {
        detail = "Thêm và xem danh sách nghi phạm vụ án";
        color = isMobile ? "yellow" : "red";
        pinColor = isMobile ? "yellow" : "red";
        noteColor = "yellow";
      } else if (node.node_kind === "victim") {
        detail = `Hồ sơ nạn nhân: ${node.title || victimName}`;
        if (!photoUrl) photoUrl = `/images/cases/${caseSlug}/victim_khang.png`;
        noteColor = "white";
      } else if (node.node_kind === "evidence_hub") {
        detail = "Danh mục vật chứng và tài liệu vụ án";
        noteColor = "white";
        pinColor = "blue";
      }

      pins.push({
        id: node.id,
        nodeKind: node.node_kind,
        subjectKey: node.subject_key || undefined,
        checkpointId: node.checkpoint_id || undefined,
        x: pos.x,
        y: pos.y,
        label: cfg.pin_title || node.title || node.node_kind,
        detail,
        photoUrl,
        noteTextureUrl: undefined,
        isAvatar: node.node_kind === "victim",
        color,
        pinColor,
        noteColor,
        scale,
        rotation,
        pulseBorder,
        actionType: "info",
      });
    });

    // Bổ sung an toàn: Nếu DB chưa có 1 trong 3 node cơ bản thì tự bù
    const hasVp = pins.some((p) => p.nodeKind === "victim_phone");
    const hasReinv = pins.some((p) => p.nodeKind === "reinvestigate");
    const hasSh = pins.some((p) => p.nodeKind === "suspects_hub");

    if (!hasVp) {
      const vpId = `${caseSlug}:victim_phone:item`;
      const vpPos = resolveNodePosition(
        vpId,
        undefined,
        1,
        isMobile,
        positions,
        { x: 0.38, y: 0.14 },
      );
      pins.push({
        id: vpId,
        nodeKind: "victim_phone",
        x: vpPos.x,
        y: vpPos.y,
        label: "Điện thoại nạn nhân",
        detail: `Vật chứng: Điện thoại thu giữ của nạn nhân ${victimName}`,
        color: "yellow",
        pinColor: "yellow",
        photoUrl: "/phone.png",
        scale: 0.85,
      });
    }
    if (!hasReinv) {
      const reinvId = `${caseSlug}:reinvestigate:scene`;
      const reinvPos = resolveNodePosition(
        reinvId,
        undefined,
        2,
        isMobile,
        positions,
        { x: 0.18, y: 0.36 },
      );
      pins.push({
        id: reinvId,
        nodeKind: "reinvestigate",
        x: reinvPos.x,
        y: reinvPos.y,
        label: "Khám xét hiện trường",
        detail: "Mở biên bản và rà soát toàn cảnh 360 hiện trường vụ án",
        color: "yellow",
        pinColor: "yellow",
        noteColor: "white",
        photoUrl: `/images/cases/${caseSlug}/crime_scene.png`,
        scale: 0.95,
        pulseBorder: input.isReinvestigateBlinking,
        actionType: "info",
      });
    }
    if (!hasSh) {
      const shId = `${caseSlug}:suspects_hub:hub`;
      const shPos = resolveNodePosition(
        shId,
        undefined,
        3,
        isMobile,
        positions,
        { x: 0.58, y: 0.38 },
      );
      pins.push({
        id: shId,
        nodeKind: "suspects_hub",
        x: shPos.x,
        y: shPos.y,
        label: "Nghi phạm",
        detail: "Thêm và xem danh sách nghi phạm vụ án",
        color: isMobile ? "yellow" : "red",
        pinColor: isMobile ? "yellow" : "red",
        noteColor: "yellow",
      });
    }
  } else {
    // Fallback an toàn: Dựng 5 node cơ bản khi database chưa chạy migration 39
    const victimName = input.victimName || "Nạn nhân";

    // 1.1. victim_phone
    const vpId = `${caseSlug}:victim_phone:item`;
    const vpPos = resolveNodePosition(
      vpId,
      undefined,
      1,
      isMobile,
      positions,
      { x: 0.38, y: 0.14 },
    );
    pins.push({
      id: vpId,
      nodeKind: "victim_phone",
      legacyId: undefined,
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
      undefined,
      2,
      isMobile,
      positions,
      { x: 0.18, y: 0.36 },
    );
    const crimeScenePhotoUrl = `/images/cases/${caseSlug}/crime_scene.png`;
    pins.push({
      id: reinvId,
      nodeKind: "reinvestigate",
      legacyId: undefined,
      x: reinvPos.x,
      y: reinvPos.y,
      label: "Khám xét hiện trường",
      detail: "Mở biên bản và rà soát toàn cảnh 360 hiện trường vụ án",
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
      undefined,
      3,
      isMobile,
      positions,
      { x: 0.58, y: 0.38 },
    );
    pins.push({
      id: shId,
      nodeKind: "suspects_hub",
      legacyId: undefined,
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
    legacyId: undefined,
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
    legacyId: undefined,
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
    const legacyId = undefined;

    // Tìm checkpoint thẩm tra tương ứng
    const matchCp = allCheckpoints.find((cp) => {
      const sKey = (cp.subjectKey || cp.subject_key || "").trim().toLowerCase();
      if (sKey && sKey === s.key) return true;
      const titleClean = removeDiacritics(cp.title || "").toLowerCase();
      const sNameClean = removeDiacritics(s.name || "").toLowerCase();
      return titleClean.includes(s.key) || titleClean.includes(sNameClean);
    });

    const fallbackCoord =
      c0DefaultSuspectCoords[s.key]
        ? c0DefaultSuspectCoords[s.key]
        : undefined;

    const pos = resolveNodePosition(
      primaryId,
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
    if (!input.isStudioMode && !activeFollowupSet.has(s.key)) return;

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
    const legacyId = undefined;
    const boardCfg = matchCp.boardConfig || matchCp.board_config;

    const suspectPin = pins.find(
      (p) => p.nodeKind === "suspect" && p.subjectKey === s.key,
    );
    const fallbackCoord =
      c0DefaultFollowupCoords[s.key]
        ? c0DefaultFollowupCoords[s.key]
        : suspectPin
          ? { x: suspectPin.x, y: Math.min(suspectPin.y + 0.22, 0.88) }
          : undefined;

    const pos = resolveNodePosition(
      primaryId,
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
    const legacyId = undefined;

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
        p.id === `node-suspect-${canonicalId}`,
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
          p.id.includes(`followup-${canonicalId}`)
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

  const seenPair = new Set<string>();
  const finalConns: CaseConnection[] = [];

  for (const c of [...conns, ...opts.adminConnections]) {
    const key1 = `${c.fromPinId}->${c.toPinId}`;
    const key2 = `${c.toPinId}->${c.fromPinId}`;
    if (!seenPair.has(key1) && !seenPair.has(key2)) {
      seenPair.add(key1);
      finalConns.push(c);
    }
  }

  return finalConns;
}

/**
 * Áp dụng các thay đổi vị trí kéo thả và transform (xoay, tỉ lệ)
 */
function findMatchingOverride<T>(
  pin: PinPoint,
  dict?: Record<string, T>,
): T | undefined {
  if (!dict) return undefined;
  // 1. Khớp chính xác ID tuyệt đối
  if (dict[pin.id] !== undefined) return dict[pin.id];
  // 2. Khớp theo legacyId nếu có
  if (pin.legacyId && dict[pin.legacyId] !== undefined) return dict[pin.legacyId];

  // 3. Khớp tương quan theo chủng loại node (canonical alias matching)
  if (pin.nodeKind === "phone_lookup") {
    for (const [key, val] of Object.entries(dict)) {
      if (
        key.includes(":phone_lookup:") ||
        key === "c0-pin-phone" ||
        key.endsWith(":phone")
      ) {
        return val;
      }
    }
  }

  if (pin.nodeKind === "indictment") {
    for (const [key, val] of Object.entries(dict)) {
      if (
        key.includes(":indictment:") ||
        key === "c0-pin-indictment" ||
        key.endsWith(":indictment")
      ) {
        return val;
      }
    }
  }

  if (pin.subjectKey) {
    const sKey = pin.subjectKey.toLowerCase();
    if (pin.nodeKind === "suspect") {
      for (const [key, val] of Object.entries(dict)) {
        const k = key.toLowerCase();
        if (
          k.endsWith(`:suspect:${sKey}`) ||
          k === `node-suspect-${sKey}` ||
          k === `c0-pin-suspect-${sKey}` ||
          k === `suspect-${sKey}`
        ) {
          return val;
        }
      }
    } else if (pin.nodeKind === "followup") {
      for (const [key, val] of Object.entries(dict)) {
        const k = key.toLowerCase();
        if (
          k.endsWith(`:followup:${sKey}`) ||
          k === `node-followup-${sKey}` ||
          k === `c0-pin-followup-${sKey}` ||
          k === `followup-${sKey}`
        ) {
          return val;
        }
      }
    }
  }

  if (pin.nodeKind === "victim_phone") {
    for (const [key, val] of Object.entries(dict)) {
      if (key.includes(":victim_phone:") || key === "c0-pin-victim-phone") return val;
    }
  }
  if (pin.nodeKind === "reinvestigate") {
    for (const [key, val] of Object.entries(dict)) {
      if (key.includes(":reinvestigate:") || key === "c0-pin-reinvestigate") return val;
    }
  }
  if (pin.nodeKind === "suspects_hub") {
    for (const [key, val] of Object.entries(dict)) {
      if (key.includes(":suspects_hub:") || key === "c0-pin-suspects") return val;
    }
  }
  if (pin.nodeKind === "evidence_hub") {
    for (const [key, val] of Object.entries(dict)) {
      if (key.includes(":evidence_hub:") || key === "c0-pin-evidence") return val;
    }
  }

  return undefined;
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
  // Khử trùng lặp ID giữa basePins và adminCustomPins
  const seenIds = new Set<string>();
  const allPins: PinPoint[] = [];

  for (const pin of [...customPins, ...adminCustomPins]) {
    if (!seenIds.has(pin.id)) {
      seenIds.add(pin.id);
      allPins.push(pin);
    }
  }

  return allPins.map((pin) => {
    const override = findMatchingOverride(pin, customPinPositions);
    const tf = findMatchingOverride(pin, pinTransforms);

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

  
  if (id.startsWith("followup-")) {
    return id.replace("followup-", "");
  }

  if (detail) {
    const d = detail.toLowerCase().trim();
    return d || id;
  }
  return id;
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
  

  return null;
}
