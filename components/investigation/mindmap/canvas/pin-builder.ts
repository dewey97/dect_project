"use client";

import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import { getCanonicalSuspectKey } from "@/lib/cases/case-000-suspects";
import { normalizeImageUrl } from "@/lib/utils";
import type { CulpritKey, SuspectItem } from "./use-investigation-state";

export const DESKTOP_SUSPECT_SLOTS = [
  { x: 0.44, y: 0.58 },
  { x: 0.6, y: 0.54 },
  { x: 0.76, y: 0.62 },
  { x: 0.76, y: 0.44 },
  { x: 0.23, y: 0.62 },
  { x: 0.26, y: 0.48 },
  { x: 0.64, y: 0.24 },
  { x: 0.88, y: 0.42 },
];

export const MOBILE_SUSPECT_SLOTS = [
  { x: 0.44, y: 0.58 },
  { x: 0.6, y: 0.54 },
  { x: 0.76, y: 0.62 },
  { x: 0.76, y: 0.44 },
  { x: 0.23, y: 0.62 },
  { x: 0.26, y: 0.48 },
  { x: 0.64, y: 0.24 },
  { x: 0.88, y: 0.42 },
];

const DYNAMIC_PHOTO_SLOTS: { x: number; y: number }[] = [
  { x: 0.88, y: 0.22 },
  { x: 0.78, y: 0.76 },
  { x: 0.62, y: 0.78 },
  { x: 0.46, y: 0.78 },
  { x: 0.38, y: 0.62 },
  { x: 0.12, y: 0.55 },
  { x: 0.88, y: 0.72 },
];

const SUSPECT_CHECKPOINT_MAP: Record<string, string> = {
  vu: "cp-000-1a",
  tung: "cp-000-1b",
  ha: "cp-000-1c",
};

function buildSuspectPins(
  effectiveSuspects: SuspectItem[],
  slots: { x: number; y: number }[],
  sheetPhotoMap: Record<string, string>,
): PinPoint[] {
  return effectiveSuspects.map((suspect, idx) => {
    const { canonicalId, slotIndex, canonicalName } =
      getCanonicalSuspectKey(suspect);
    const assignedSlotIndex = typeof slotIndex === "number" && slotIndex >= 0 && slotIndex < 3
      ? slotIndex
      : (3 + (idx % (slots.length - 3)));
    const slot = slots[assignedSlotIndex] || slots[idx % slots.length] || slots[0];
    const cpId = SUSPECT_CHECKPOINT_MAP[canonicalId] || `cp-${canonicalId}`;
    return {
      id: `node-suspect-${canonicalId}`,
      x: slot.x,
      y: slot.y,
      label: canonicalName || suspect.name,
      detail: `Nghi phạm: ${canonicalName || suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
      color: "blue" as const,
      photoUrl:
        sheetPhotoMap[canonicalId] ||
        "/images/avatar_placeholder.svg",
      isAvatar: true,
      actionType: cpId ? ("sheet_checkpoint" as const) : ("info" as const),
      checkpointId: cpId || undefined,
    };
  });
}

function buildFollowupPins(
  effectiveSuspects: SuspectItem[],
  slots: { x: number; y: number }[],
  activeFollowupSet: Set<string>,
): PinPoint[] {
  const pins: PinPoint[] = [];

  effectiveSuspects.forEach((suspect, idx) => {
    const { canonicalId, slotIndex, canonicalName } =
      getCanonicalSuspectKey(suspect);
    if (!activeFollowupSet.has(canonicalId)) return;

    const assignedSlotIndex =
      typeof slotIndex === "number" && slotIndex >= 0 && slotIndex < 3
        ? slotIndex
        : 3 + (idx % (slots.length - 3));
    const slot =
      slots[assignedSlotIndex] || slots[idx % slots.length] || slots[0];

    // Đối với 3 nhân vật kinh điển của Case #000, giữ nguyên tọa độ gốc
    if (canonicalId === "vu") {
      pins.push({
        id: "c0-pin-followup-vu",
        x: 0.44,
        y: 0.82,
        label: "Nghi vấn",
        detail: "Nghi vấn suy luận mở rộng đối tượng Lê Quang Vũ",
        color: "purple" as const,
        noteColor: "yellow" as const,
        actionType: "sheet_checkpoint" as const,
        checkpointId: "cp-000-1a-followup",
      });
      return;
    }

    if (canonicalId === "tung") {
      pins.push({
        id: "c0-pin-followup-tung",
        x: 0.6,
        y: 0.75,
        label: "Nghi vấn",
        detail: "Nghi vấn suy luận mở rộng đối tượng Nguyễn Thanh Tùng",
        color: "purple" as const,
        noteColor: "yellow" as const,
        actionType: "sheet_checkpoint" as const,
        checkpointId: "cp-000-1b-followup",
      });
      return;
    }

    if (canonicalId === "ha") {
      pins.push({
        id: "c0-pin-followup-ha",
        x: 0.76,
        y: 0.77,
        label: "Nghi vấn",
        detail: "Xác định khoá mật khẩu hộp thiếc đáng ngờ",
        color: "purple" as const,
        noteColor: "yellow" as const,
        actionType: "sheet_checkpoint" as const,
        checkpointId: "cp-000-1c-followup",
      });
      return;
    }

    // Với bất kỳ nghi phạm động mới nào: Đặt ngay dưới chân thẻ ảnh của họ
    pins.push({
      id: `c0-pin-followup-${canonicalId}`,
      x: slot.x,
      y: Math.min(slot.y + 0.22, 0.88),
      label: "Nghi vấn",
      detail: `Nghi vấn suy luận mở rộng đối tượng ${canonicalName || suspect.name}`,
      color: "purple" as const,
      noteColor: "yellow" as const,
      actionType: "sheet_checkpoint" as const,
      checkpointId: `cp-${canonicalId}-followup`,
    });
  });

  return pins;
}

export type PinBuilderInput = {
  isMobile: boolean;
  effectiveSuspects: SuspectItem[];
  sheetPhotoMap: Record<string, string>;
  sheetPinnedItems?: Array<{
    code?: string;
    photo_code?: string;
    label?: string;
    title?: string;
    drive_url?: string;
    direct_cdn_url?: string;
    url?: string;
    description?: string;
    category?: string;
    board_x?: string | number;
    board_y?: string | number;
  }>;
  followupCulpritIds?: string[];
  hasVuFollowup?: boolean;
  hasTungFollowup?: boolean;
  hasHaFollowup?: boolean;
  effectiveReinvestigateUnlocked: boolean;
  effectivePhoneSolved: boolean;
  effectiveIndictmentSolved: boolean;
  isReinvestigateBlinking: boolean;
};

/** Dựng danh sách ghim động mobile/desktop + suspect + followup. */
export function buildCustomPins(input: PinBuilderInput): PinPoint[] {
  const slots = input.isMobile ? MOBILE_SUSPECT_SLOTS : DESKTOP_SUSPECT_SLOTS;
  const suspectPins = buildSuspectPins(
    input.effectiveSuspects,
    slots,
    input.sheetPhotoMap,
  );

  const activeFollowupSet = new Set<string>(input.followupCulpritIds || []);
  if (input.hasVuFollowup) activeFollowupSet.add("vu");
  if (input.hasTungFollowup) activeFollowupSet.add("tung");
  if (input.hasHaFollowup) activeFollowupSet.add("ha");

  const followupPins = buildFollowupPins(
    input.effectiveSuspects,
    slots,
    activeFollowupSet,
  );

  const base = input.isMobile
    ? ([
        {
          id: "c0-pin-evidence",
          x: 0.2,
          y: 0.18,
          label: "Bổ sung chứng cứ",
          detail: "Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra",
          color: "red" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-phone",
          x: 0.42,
          y: 0.27,
          label: "Mở rộng điều tra",
          detail: input.effectivePhoneSolved
            ? "Đã xác minh danh tính SĐT thành công"
            : "Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang",
          color: input.effectivePhoneSolved
            ? ("cyan" as const)
            : ("yellow" as const),
          noteColor: "white" as const,
          isSolved: input.effectivePhoneSolved,
        },
        {
          id: "c0-pin-victim-phone",
          x: 0.38,
          y: 0.14,
          label: "Điện thoại nạn nhân",
          detail:
            "Vật chứng: Điện thoại iPhone 6s Plus thu giữ của nạn nhân Nguyễn Văn Khang",
          color: "yellow" as const,
          photoUrl: "/phone.png",
          scale: 0.85,
        },
        {
          id: "c0-pin-reinvestigate",
          x: 0.2,
          y: 0.35,
          label: input.effectiveReinvestigateUnlocked
            ? "Khám xét lại"
            : "Khám xét lại (Chờ phê duyệt)",
          detail: input.effectiveReinvestigateUnlocked
            ? "Mở biên bản tái khám xét hiện trường"
            : "Khám xét lại hiện trường [Chờ phê duyệt lệnh — Cần trả lời xong câu hỏi của Vũ & Tùng]",
          color: input.effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          noteColor: "white" as const,
          pinColor: input.effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          pulseBorder: input.isReinvestigateBlinking,
          isLocked: !input.effectiveReinvestigateUnlocked,
        },
        {
          id: "c0-pin-suspects",
          x: 0.58,
          y: 0.38,
          label: "Nghi phạm",
          detail: "Thêm & xem danh sách nghi phạm vụ án",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-indictment",
          x: 0.22,
          y: 0.8,
          label: "Bản kết luận điều tra",
          detail: input.effectiveIndictmentSolved
            ? "Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!"
            : "Lập bản cáo trạng gửi Viện Kiểm sát",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "white" as const,
        },
      ] as PinPoint[])
    : ([
        {
          id: "c0-pin-evidence",
          x: 0.2,
          y: 0.18,
          label: "Bổ sung chứng cứ",
          detail: "Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-phone",
          x: 0.42,
          y: 0.27,
          label: "Mở rộng điều tra",
          detail: input.effectivePhoneSolved
            ? "Đã xác minh danh tính SĐT thành công"
            : "Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          noteColor: "white" as const,
          isSolved: input.effectivePhoneSolved,
        },
        {
          id: "c0-pin-victim-phone",
          x: 0.38,
          y: 0.14,
          label: "Điện thoại nạn nhân",
          detail:
            "Vật chứng: Điện thoại iPhone 6s Plus thu giữ của nạn nhân Nguyễn Văn Khang",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          photoUrl: "/phone.png",
          scale: 0.85,
        },
        {
          id: "c0-pin-reinvestigate",
          x: 0.2,
          y: 0.35,
          label: input.effectiveReinvestigateUnlocked
            ? "Khám xét lại"
            : "Khám xét lại (Chờ phê duyệt)",
          detail: input.effectiveReinvestigateUnlocked
            ? "Mở biên bản tái khám xét hiện trường"
            : "Khám xét lại hiện trường [Chờ phê duyệt lệnh — Cần trả lời xong câu hỏi của Vũ & Tùng]",
          color: input.effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          noteColor: "white" as const,
          pinColor: input.effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          pulseBorder: input.isReinvestigateBlinking,
          isLocked: !input.effectiveReinvestigateUnlocked,
        },
        {
          id: "c0-pin-suspects",
          x: 0.58,
          y: 0.38,
          label: "Nghi phạm",
          detail: "Thêm & xem danh sách nghi phạm vụ án",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-indictment",
          x: 0.22,
          y: 0.8,
          label: "Bản kết luận điều tra",
          detail: input.effectiveIndictmentSolved
            ? "Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!"
            : "Lập bản cáo trạng gửi Viện Kiểm sát",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "white" as const,
        },
      ] as PinPoint[]);

  // Dynamically pin any evidence/photo from Google Sheets where pin_on_board is TRUE
  const dynamicPhotoPins: PinPoint[] = [];
  if (Array.isArray(input.sheetPinnedItems)) {
    let autoSlotIdx = 0;
    input.sheetPinnedItems.forEach((item) => {
      const code = String(item.code || item.photo_code || "").trim();
      const codeLower = code.toLowerCase();
      if (!codeLower) return;

      const rawX = typeof item.board_x === "number" ? item.board_x : parseFloat(String(item.board_x || ""));
      const rawY = typeof item.board_y === "number" ? item.board_y : parseFloat(String(item.board_y || ""));
      const hasCustomCoords = !isNaN(rawX) && !isNaN(rawY) && rawX > 0 && rawY > 0;

      let posX = rawX;
      let posY = rawY;
      if (!hasCustomCoords) {
        const slot = DYNAMIC_PHOTO_SLOTS[autoSlotIdx % DYNAMIC_PHOTO_SLOTS.length];
        posX = slot.x;
        posY = slot.y;
        autoSlotIdx++;
      }

      const pinId = `c0-pin-evidence-${codeLower}`;
      const pinColor: "yellow" | "red" | "blue" | "orange" = "yellow";

      const rawUrl = item.drive_url || item.direct_cdn_url || item.url || "";
      const fallbackPhoto =
        input.sheetPhotoMap?.[codeLower.replace(/^avatar_/, "")] ||
        input.sheetPhotoMap?.[codeLower];
      const photoUrl = rawUrl
        ? normalizeImageUrl(rawUrl)
        : fallbackPhoto || "/images/avatar_placeholder.svg";

      const rawCategory = String(item.category || "").toUpperCase().trim();
      const rawLabel = String(item.label || item.title || "").toLowerCase().trim();
      const isAvatar =
        rawCategory === "AVATAR" ||
        codeLower.startsWith("avatar_") ||
        rawLabel.includes("ảnh chân dung") ||
        rawLabel.includes("chân dung");

      dynamicPhotoPins.push({
        id: pinId,
        x: posX,
        y: posY,
        label: item.label || item.title || item.code || "Vật chứng",
        detail: item.description || `Vật chứng vụ án: ${item.label || item.code}`,
        color: pinColor,
        photoUrl,
        isAvatar,
        actionType: "info" as const,
      });
    });
  }

  return [...base, ...followupPins, ...suspectPins, ...dynamicPhotoPins];
}

export function buildCustomConnections(opts: {
  effectiveSuspects: SuspectItem[];
  followupCulpritIds?: string[];
  hasVuFollowup?: boolean;
  hasTungFollowup?: boolean;
  hasHaFollowup?: boolean;
  vuSuspect?: SuspectItem;
  tungSuspect?: SuspectItem;
  haSuspect?: SuspectItem;
  adminConnections: CaseConnection[];
}): CaseConnection[] {
  const activeFollowupSet = new Set<string>(opts.followupCulpritIds || []);
  if (opts.hasVuFollowup) activeFollowupSet.add("vu");
  if (opts.hasTungFollowup) activeFollowupSet.add("tung");
  if (opts.hasHaFollowup) activeFollowupSet.add("ha");

  const conns: CaseConnection[] = [
    {
      id: "c0-conn-phone",
      fromPinId: "c0-pin-evidence",
      toPinId: "c0-pin-phone",
    },
    {
      id: "c0-conn-reinvestigate",
      fromPinId: "c0-pin-evidence",
      toPinId: "c0-pin-reinvestigate",
    },
  ];

  // 1. Dây đỏ từ note 'Nghi phạm' sang tất cả các nghi phạm
  opts.effectiveSuspects.forEach((suspect) => {
    const { canonicalId } = getCanonicalSuspectKey(suspect);
    conns.push({
      id: `c0-conn-${canonicalId}`,
      fromPinId: "c0-pin-suspects",
      toPinId: `node-suspect-${canonicalId}`,
    });

    // 2. Dây đỏ từ từng nghi phạm sang note 'Nghi vấn' của chính họ (nếu có)
    if (activeFollowupSet.has(canonicalId)) {
      conns.push({
        id: `c0-conn-followup-${canonicalId}`,
        fromPinId: `node-suspect-${canonicalId}`,
        toPinId: `c0-pin-followup-${canonicalId}`,
      });
    }
  });

  return [...conns, ...opts.adminConnections];
}

export function applyLayoutOverrides(
  customPins: PinPoint[],
  adminCustomPins: PinPoint[],
  customPinPositions: Record<string, { x: number; y: number }>,
  pinTransforms: Record<string, { rotation: number; scale: number }>,
): PinPoint[] {
  return [...customPins, ...adminCustomPins].map((pin) => {
    const override = customPinPositions[pin.id];
    const tf = pinTransforms[pin.id];
    return {
      ...pin,
      ...(override ? { x: override.x, y: override.y } : {}),
      rotation: tf?.rotation !== undefined ? tf.rotation : pin.rotation,
      scale: tf?.scale !== undefined ? tf.scale : pin.scale,
    };
  });
}

export function findFollowupCulprit(pinId: string, detail: string): string {
  const id = pinId || "";
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

export function detectCheckpointForPin(pin?: PinPoint): string | null {
  if (!pin) return null;
  if (pin.checkpointId) return pin.checkpointId;

  // Chỉ nhận diện các node có actionType rõ ràng hoặc mã ID chuyên biệt
  const id = pin.id || "";
  if (id === "c0-pin-phone") return "cp-000-0";
  if (id === "c0-pin-followup-vu") return "cp-000-1a-followup";
  if (id === "c0-pin-followup-tung") return "cp-000-1b-followup";
  if (id === "c0-pin-followup-ha") return "cp-000-1c-followup";
  if (id === "c0-pin-indictment") return "cp-000-2b";
  if (id === "c0-pin-reinvestigate") return "cp-000-convergence";
  if (id.startsWith("c0-pin-followup-")) {
    return `cp-${id.replace("c0-pin-followup-", "")}-followup`;
  }

  if (pin.actionType === "sheet_checkpoint" || pin.actionType === "custom_question") {
    const pText = `${id} ${(pin.label || "").toLowerCase()} ${(pin.detail || "").toLowerCase()}`;
    if (pText.includes("vu") || pText.includes("vũ")) return "cp-000-1a";
    if (pText.includes("tung") || pText.includes("tùng")) return "cp-000-1b";
    if (pText.includes("ha") || pText.includes("hà")) return "cp-000-1c";
    if (pText.includes("phone") || pText.includes("sđt")) return "cp-000-0";
    if (pText.includes("indictment") || pText.includes("cáo trạng")) return "cp-000-2b";
    if (pText.includes("kham-xet") || pText.includes("khám xét") || pText.includes("hội tụ")) return "cp-000-convergence";
  }

  return null;
}
