"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import type {
  DbCaseBoardNode,
  DbCaseCharacter,
  DbCaseCheckpoint,
} from "@/lib/types/database";
import type { Checkpoint } from "@/lib/types";
import { normalizeCaseId } from "@/lib/cases/case-id";
import {
  getBoardNodes,
  getBoardgamePinPositions,
} from "@/lib/actions/board-actions";
import { getCheckpointsByCase } from "@/lib/actions/checkpoint-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
import { getCaseEvidence } from "@/lib/actions/evidence-actions";
import {
  applyLayoutOverrides,
  buildCustomConnections,
  buildCustomPins,
  type SheetPinnedItem,
} from "./pin-builder";
import type { SuspectItem } from "./use-investigation-state";

export interface UseBoardModelOptions {
  isMobile?: boolean;
  // Cho phép Studio/Gameplay truyền sẵn dữ liệu để tránh gọi lại API không cần thiết
  initialCheckpoints?: DbCaseCheckpoint[] | Checkpoint[];
  initialCharacters?: DbCaseCharacter[];
  initialBoardNodes?: DbCaseBoardNode[];
  initialEvidence?: SheetPinnedItem[];
  // Dành riêng cho Gameplay (tiến trình giải đố động)
  effectiveSuspects?: SuspectItem[];
  followupCulpritIds?: string[];
  effectivePhoneSolved?: boolean;
  effectiveIndictmentSolved?: boolean;
  effectiveReinvestigateUnlocked?: boolean;
  isReinvestigateBlinking?: boolean;
  // Dành cho chế độ Studio (vị trí kéo thả tức thời)
  overridePositions?: Record<string, { x: number; y: number }>;
}

export interface BoardModelReturn {
  pins: PinPoint[];
  connections: CaseConnection[];
  positions: Record<string, { x: number; y: number }>;
  transforms: Record<string, { rotation: number; scale: number }>;
  boardNodes: DbCaseBoardNode[];
  checkpoints: DbCaseCheckpoint[];
  characters: DbCaseCharacter[];
  evidence: SheetPinnedItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updatePosition: (pinId: string, x: number, y: number) => void;
  updateTransform: (
    pinId: string,
    transform: { rotation?: number; scale?: number },
  ) => void;
}

/**
 * Hook mô hình bảng dùng chung cho cả Gameplay và Checkpoint Studio.
 * Đảm bảo Studio và Gameplay luôn nhìn thấy cùng một tập hợp ghim:
 * - Nạn nhân (victim)
 * - Tra cứu SĐT (phone_lookup / victim_phone)
 * - Khám xét hiện trường (reinvestigate)
 * - Hub nghi phạm (suspects_hub)
 * - Toàn bộ nghi phạm (suspect pins)
 * - Câu hỏi mở rộng (followup)
 * - Cáo trạng (indictment)
 * - Các custom board nodes
 */
export function useBoardModel(
  caseIdInput: string = "case_000",
  options: UseBoardModelOptions = {},
): BoardModelReturn {
  const caseId = normalizeCaseId(caseIdInput);
  const isMobile = Boolean(options.isMobile);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [boardNodes, setBoardNodes] = useState<DbCaseBoardNode[]>(
    options.initialBoardNodes || [],
  );
  const [checkpoints, setCheckpoints] = useState<DbCaseCheckpoint[]>(
    (options.initialCheckpoints as DbCaseCheckpoint[]) || [],
  );
  const [characters, setCharacters] = useState<DbCaseCharacter[]>(
    options.initialCharacters || [],
  );
  const [evidence, setEvidence] = useState<SheetPinnedItem[]>(
    options.initialEvidence || [],
  );
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [transforms, setTransforms] = useState<
    Record<string, { rotation: number; scale: number }>
  >({});
  const [adminCustomPins, setAdminCustomPins] = useState<PinPoint[]>([]);
  const [adminConnections, setAdminConnections] = useState<CaseConnection[]>([]);

  const isMountedRef = useRef(false);

  useEffect(() => {
    if (options.initialCheckpoints && options.initialCheckpoints.length > 0) {
      setCheckpoints(options.initialCheckpoints as DbCaseCheckpoint[]);
    }
  }, [options.initialCheckpoints]);

  useEffect(() => {
    if (options.initialCharacters && options.initialCharacters.length > 0) {
      setCharacters(options.initialCharacters);
    }
  }, [options.initialCharacters]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nodesRes, boardgameRes, checkpointsRes, charactersRes, evidenceRes] =
        await Promise.all([
          getBoardNodes(caseId),
          getBoardgamePinPositions(caseId),
          getCheckpointsByCase(caseId),
          getCharactersByCase(caseId),
          getCaseEvidence(caseId),
        ]);

      if (nodesRes.success && nodesRes.data) {
        setBoardNodes(nodesRes.data);
      }

      if (checkpointsRes.success && checkpointsRes.data) {
        setCheckpoints(checkpointsRes.data);
      }

      if (charactersRes.success && charactersRes.data) {
        setCharacters(charactersRes.data);
      }

      if (evidenceRes.success && evidenceRes.data) {
        const mappedEv: SheetPinnedItem[] = evidenceRes.data.map((e) => ({
          code: e.code,
          photo_code: e.code,
          title: e.title,
          label: e.title,
          direct_cdn_url: e.file_url || e.thumb_url || undefined,
          url: e.file_url || e.thumb_url || undefined,
          description: e.description || undefined,
          category: e.kind,
        }));
        setEvidence(mappedEv);
      }

      // Xử lý boardgame_pins & connections
      const posMap: Record<string, { x: number; y: number }> = {};
      const tfMap: Record<string, { rotation: number; scale: number }> = {};
      const customPins: PinPoint[] = [];

      if (boardgameRes.success) {
        boardgameRes.pins.forEach((p) => {
          posMap[p.id] = { x: p.x, y: p.y };
          if (
            p.id.startsWith("admin-pin-") ||
            p.id.startsWith("custom-pin-") ||
            p.id.includes(":custom:")
          ) {
            customPins.push(p);
          }
          if (typeof p.rotation === "number" || typeof p.scale === "number") {
            tfMap[p.id] = {
              rotation: p.rotation ?? 0,
              scale: p.scale ?? 1.0,
            };
          }
        });
        setAdminCustomPins(customPins);
        setAdminConnections(boardgameRes.connections || []);
      }

      // Nạp thêm tọa độ desktop/mobile từ case_board_nodes nếu chưa có trong boardgame_pins
      if (nodesRes.success && nodesRes.data) {
        nodesRes.data.forEach((n) => {
          if (!posMap[n.id]) {
            const pos = (n.config as any)?.position;
            const chosen = isMobile ? pos?.mobile : pos?.desktop;
            if (
              chosen &&
              typeof chosen.x === "number" &&
              typeof chosen.y === "number"
            ) {
              posMap[n.id] = { x: chosen.x, y: chosen.y };
            }
          }
        });
      }

      setPositions(posMap);
      setTransforms(tfMap);
    } catch (err: unknown) {
      console.error("[useBoardModel] Error loading board model data:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [caseId, isMobile]);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  // Cập nhật tọa độ cục bộ (khi kéo thả trên canvas)
  const updatePosition = useCallback((pinId: string, x: number, y: number) => {
    setPositions((prev) => ({
      ...prev,
      [pinId]: { x, y },
    }));
  }, []);

  // Cập nhật góc quay / tỷ lệ
  const updateTransform = useCallback(
    (pinId: string, tf: { rotation?: number; scale?: number }) => {
      setTransforms((prev) => {
        const current = prev[pinId] || { rotation: 0, scale: 1.0 };
        return {
          ...prev,
          [pinId]: {
            rotation: tf.rotation !== undefined ? tf.rotation : current.rotation,
            scale: tf.scale !== undefined ? tf.scale : current.scale,
          },
        };
      });
    },
    [],
  );

  // Tạo danh sách nghi phạm hợp nhất:
  // Nếu caller truyền effectiveSuspects (gameplay) thì dùng;
  // Nếu không (Studio), tự động sinh đầy đủ từ characters để GM luôn thấy mọi nghi phạm trên bảng
  const effectiveSuspectsList = useMemo(() => {
    if (options.effectiveSuspects && options.effectiveSuspects.length > 0) {
      return options.effectiveSuspects;
    }
    return characters
      .filter((c) => c.role !== "victim")
      .map((c) => ({
        id: `suspect-${c.key}`,
        name: c.name,
        clueIds: [],
      }));
  }, [options.effectiveSuspects, characters]);

  // Tên nạn nhân
  const victimName = useMemo(() => {
    const victim = characters.find((c) => c.role === "victim");
    return victim?.name || "Nạn nhân";
  }, [characters]);

  // Hợp nhất vị trí thực tế (kết hợp positions và overridePositions nếu có)
  const mergedPositions = useMemo(() => {
    if (!options.overridePositions) return positions;
    return { ...positions, ...options.overridePositions };
  }, [positions, options.overridePositions]);

  // Dựng danh sách toàn bộ các ghim (pins)
  const basePins = useMemo(() => {
    return buildCustomPins({
      isMobile,
      caseId,
      caseSlug: caseId,
      boardNodes,
      characters,
      caseCheckpoints: checkpoints as unknown as Checkpoint[],
      evidence,
      positions: mergedPositions,
      effectiveSuspects: effectiveSuspectsList,
      followupCulpritIds: options.followupCulpritIds,
      effectivePhoneSolved: options.effectivePhoneSolved,
      effectiveIndictmentSolved: options.effectiveIndictmentSolved,
      effectiveReinvestigateUnlocked: options.effectiveReinvestigateUnlocked,
      isReinvestigateBlinking: options.isReinvestigateBlinking,
      victimName,
    });
  }, [
    isMobile,
    caseId,
    boardNodes,
    characters,
    checkpoints,
    evidence,
    mergedPositions,
    effectiveSuspectsList,
    options.followupCulpritIds,
    options.effectivePhoneSolved,
    options.effectiveIndictmentSolved,
    options.effectiveReinvestigateUnlocked,
    options.isReinvestigateBlinking,
    victimName,
  ]);

  // Áp dụng overrides và admin custom pins
  const displayPins = useMemo(() => {
    return applyLayoutOverrides(
      basePins,
      adminCustomPins,
      mergedPositions,
      transforms,
    );
  }, [basePins, adminCustomPins, mergedPositions, transforms]);

  // Dựng danh sách dây nối (connections)
  const connections = useMemo(() => {
    return buildCustomConnections({
      effectiveSuspects: effectiveSuspectsList,
      followupCulpritIds: options.followupCulpritIds,
      activePins: displayPins,
      adminConnections,
    });
  }, [
    effectiveSuspectsList,
    options.followupCulpritIds,
    displayPins,
    adminConnections,
  ]);

  return {
    pins: displayPins,
    connections,
    positions: mergedPositions,
    transforms,
    boardNodes,
    checkpoints,
    characters,
    evidence,
    isLoading,
    error,
    refresh: loadData,
    updatePosition,
    updateTransform,
  };
}
