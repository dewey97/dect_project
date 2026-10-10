"use client";

import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import { getCanonicalSuspectKey } from "@/lib/cases/case-000-suspects";
import type { CulpritKey, SuspectItem } from "./use-investigation-state";

export const DESKTOP_SUSPECT_SLOTS = [
  { x: 0.44, y: 0.58 },
  { x: 0.6, y: 0.54 },
  { x: 0.76, y: 0.62 },
  { x: 0.76, y: 0.44 },
  { x: 0.23, y: 0.62 },
  { x: 0.26, y: 0.48 },
  { x: 0.64, y: 0.24 },
  { x: 0.76, y: 0.44 },
];

export const MOBILE_SUSPECT_SLOTS = [
  { x: 0.44, y: 0.58 },
  { x: 0.6, y: 0.54 },
  { x: 0.76, y: 0.62 },
  { x: 0.76, y: 0.44 },
  { x: 0.23, y: 0.62 },
  { x: 0.26, y: 0.48 },
  { x: 0.64, y: 0.24 },
  { x: 0.76, y: 0.44 },
];

const SUSPECT_PHOTO_MAP: Record<string, string> = {
  vu: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vu.png",
  tung: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_tung.png",
  ha: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ha.png",
  mai: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_mai.png",
  khang: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
  dat: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_dat_ga.png",
  lua: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ba_lua.png",
  vy: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vy.png",
};

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
  return effectiveSuspects.map((suspect) => {
    const { canonicalId, slotIndex, canonicalName } =
      getCanonicalSuspectKey(suspect);
    const slot = slots[slotIndex] || slots[0];
    const cpId = SUSPECT_CHECKPOINT_MAP[canonicalId];
    return {
      id: `node-suspect-${canonicalId}`,
      x: slot.x,
      y: slot.y,
      label: canonicalName || suspect.name,
      detail: `Nghi phạm: ${canonicalName || suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
      color: "blue" as const,
      photoUrl:
        sheetPhotoMap[canonicalId] ||
        SUSPECT_PHOTO_MAP[canonicalId] ||
        undefined,
      actionType: cpId ? ("sheet_checkpoint" as const) : ("info" as const),
      checkpointId: cpId || undefined,
    };
  });
}

function buildFollowupPins(
  hasVu: boolean,
  hasTung: boolean,
  hasHa: boolean,
): PinPoint[] {
  return [
    ...(hasVu
      ? [
          {
            id: "c0-pin-followup-vu",
            x: 0.44,
            y: 0.82,
            label: "Nghi vấn",
            detail: "Nghi vấn suy luận mở rộng đối tượng Lê Quang Vũ",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1a",
          },
        ]
      : []),
    ...(hasTung
      ? [
          {
            id: "c0-pin-followup-tung",
            x: 0.6,
            y: 0.75,
            label: "Nghi vấn",
            detail: "Nghi vấn suy luận mở rộng đối tượng Nguyễn Thanh Tùng",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1b",
          },
        ]
      : []),
    ...(hasHa
      ? [
          {
            id: "c0-pin-followup-ha",
            x: 0.76,
            y: 0.77,
            label: "Nghi vấn",
            detail: "Khớp nối chứng cứ đối tượng Trần Thị Hà",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1c",
          },
        ]
      : []),
  ];
}

export type PinBuilderInput = {
  isMobile: boolean;
  effectiveSuspects: SuspectItem[];
  sheetPhotoMap: Record<string, string>;
  hasVuFollowup: boolean;
  hasTungFollowup: boolean;
  hasHaFollowup: boolean;
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
  const followupPins = buildFollowupPins(
    input.hasVuFollowup,
    input.hasTungFollowup,
    input.hasHaFollowup,
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
          id: "c0-pin-victim-khang",
          x: 0.55,
          y: 0.12,
          label: "Nạn nhân Nguyễn Văn Khang",
          detail:
            "Nạn nhân vụ án — Thi thể được phát hiện tại bờ sông xóm Chài",
          color: "red" as const,
          photoUrl:
            input.sheetPhotoMap.khang ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
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
          id: "c0-pin-crime-scene",
          x: 0.73,
          y: 0.21,
          label: "Hiện trường thi thể",
          detail: "Ảnh hiện trường khám nghiệm tử thi và vệt máu trên sàn",
          color: "orange" as const,
          photoUrl:
            input.sheetPhotoMap.crime_scene ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png",
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
          id: "c0-pin-victim-khang",
          x: 0.55,
          y: 0.12,
          label: "Nạn nhân Nguyễn Văn Khang",
          detail:
            "Nạn nhân vụ án — Thi thể được phát hiện tại bờ sông xóm Chài",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          photoUrl:
            input.sheetPhotoMap.khang ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
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
          id: "c0-pin-crime-scene",
          x: 0.73,
          y: 0.21,
          label: "Hiện trường thi thể",
          detail: "Ảnh hiện trường khám nghiệm tử thi và vệt máu trên sàn",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          photoUrl:
            input.sheetPhotoMap.crime_scene ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png",
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

  return [...base, ...followupPins, ...suspectPins];
}

export function buildCustomConnections(opts: {
  effectiveSuspects: SuspectItem[];
  hasVuFollowup: boolean;
  hasTungFollowup: boolean;
  hasHaFollowup: boolean;
  vuSuspect?: SuspectItem;
  tungSuspect?: SuspectItem;
  haSuspect?: SuspectItem;
  adminConnections: CaseConnection[];
}): CaseConnection[] {
  return [
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
    ...(opts.hasVuFollowup && opts.vuSuspect
      ? [
          {
            id: "c0-conn-followup-vu",
            fromPinId: `node-suspect-${getCanonicalSuspectKey(opts.vuSuspect).canonicalId}`,
            toPinId: "c0-pin-followup-vu",
          },
        ]
      : []),
    ...(opts.hasTungFollowup && opts.tungSuspect
      ? [
          {
            id: "c0-conn-followup-tung",
            fromPinId: `node-suspect-${getCanonicalSuspectKey(opts.tungSuspect).canonicalId}`,
            toPinId: "c0-pin-followup-tung",
          },
        ]
      : []),
    ...(opts.hasHaFollowup && opts.haSuspect
      ? [
          {
            id: "c0-conn-followup-ha",
            fromPinId: `node-suspect-${getCanonicalSuspectKey(opts.haSuspect).canonicalId}`,
            toPinId: "c0-pin-followup-ha",
          },
        ]
      : []),
    ...opts.effectiveSuspects.map((suspect) => {
      const { canonicalId } = getCanonicalSuspectKey(suspect);
      return {
        id: `c0-conn-${canonicalId}`,
        fromPinId: "c0-pin-suspects",
        toPinId: `node-suspect-${canonicalId}`,
      };
    }),
    ...opts.adminConnections,
  ];
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

export function findFollowupCulprit(pinId: string, detail: string): CulpritKey {
  const id = pinId || "";
  const d = (detail || "").toLowerCase();
  if (id.includes("ha") || d.includes("hà")) return "ha";
  if (id.includes("tung") || d.includes("tùng")) return "tung";
  return "vu";
}

export function detectCheckpointForPin(pin?: PinPoint): string | null {
  if (pin?.checkpointId) return pin.checkpointId;
  const pText = `${pin?.id || ""} ${(pin?.label || "").toLowerCase()} ${(pin?.detail || "").toLowerCase()}`;
  if (pText.includes("vu") || pText.includes("vũ")) return "cp-000-1a";
  if (pText.includes("tung") || pText.includes("tùng")) return "cp-000-1b";
  if (pText.includes("ha") || pText.includes("hà")) return "cp-000-1c";
  if (
    pText.includes("phone") ||
    pText.includes("điện thoại") ||
    pText.includes("sđt")
  )
    return "cp-000-0";
  if (pText.includes("indictment") || pText.includes("cáo trạng"))
    return "cp-000-2b";
  return null;
}
