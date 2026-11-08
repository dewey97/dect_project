"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  DbCase,
  DbCaseCheckpoint,
  DbCaseDossier,
  DbCaseCharacter,
  BoardConfig,
} from "@/lib/types/database";
import { lintCase } from "@/lib/checkpoints/case-linter";
import { launchPlaytestFromCheckpoint } from "@/lib/checkpoints/case-playtest";
import { CaseLintModal } from "./case-lint-modal";
import {
  createEmptyDraft,
  toDraft,
  type CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import {
  deleteCheckpoint,
  saveCheckpoint,
} from "@/lib/actions/checkpoint-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
import {
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import { isAnswerKind } from "@/lib/checkpoints/kinds";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CheckpointFlowView } from "./checkpoint-flow-view";
import { FloatingBoardPanel } from "./floating-board-panel";
import { useBoardEditor } from "./board/use-board-editor";
import { CheckpointStudioInspector } from "./studio-inspector";
import { CheckpointStudioHeader } from "./studio-header";
import { useResizableSidebar } from "./use-resizable-sidebar";
import { useFlowDependencies } from "./use-flow-dependencies";
import { boardPath } from "@/lib/play/routes";

interface CheckpointStudioClientProps {
  initialCaseId: string;
  initialCases?: DbCase[];
  initialRows?: DbCaseCheckpoint[];
  initialDossiers?: DbCaseDossier[];
  initialAvailableDocuments?: AvailableDocumentItem[];
  initialCharacters?: DbCaseCharacter[];
  initialView?: "flow" | "board";
}

export function CheckpointStudioClient({
  initialCaseId,
  initialCases = [],
  initialRows = [],
  initialDossiers = [],
  initialAvailableDocuments = [],
  initialCharacters = [],
  initialView = "flow",
}: CheckpointStudioClientProps) {
  const caseId = initialCaseId;
  const [activeView] = useState<"flow" | "board">(initialView);

  // Giữ vụ án và view đang chọn trên URL (?case=...&view=...) để tương thích ngược 100% với URL query cũ
  useEffect(() => {
    const url = new URL(window.location.href);
    let changed = false;
    if (url.searchParams.get("case") !== caseId) {
      url.searchParams.set("case", caseId);
      changed = true;
    }
    if (activeView === "board") {
      if (url.searchParams.get("view") !== "board") {
        url.searchParams.set("view", "board");
        changed = true;
      }
    } else {
      if (url.searchParams.has("view")) {
        url.searchParams.delete("view");
        changed = true;
      }
    }
    if (changed) {
      window.history.replaceState(null, "", url);
    }
  }, [caseId, activeView]);

  const [isFloatingBoardOpen, setIsFloatingBoardOpen] = useState(true);
  const { sidebarWidth, isResizing, startResizing } = useResizableSidebar();

  const router = useRouter();
  const [rows, setRows] = useState<DbCaseCheckpoint[]>(initialRows);
  const [dossiers] = useState<DbCaseDossier[]>(initialDossiers);
  const [availableDocs] = useState<AvailableDocumentItem[]>(
    initialAvailableDocuments,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRows[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<CheckpointStudioDraft | null>(
    initialRows[0] ? toDraft(initialRows[0]) : null,
  );
  const [baseline, setBaseline] = useState<string>(
    initialRows[0] ? JSON.stringify(toDraft(initialRows[0])) : "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [characters, setCharacters] =
    useState<DbCaseCharacter[]>(initialCharacters);
  const [isLintModalOpen, setIsLintModalOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<
    "checkpoints" | "characters" | "indictment" | "epilogue"
  >("checkpoints");
  const [selectedCharacter, setSelectedCharacter] =
    useState<DbCaseCharacter | null>(null);

  // Lưu nháp toàn cục các Checkpoint đã chỉnh sửa (targetKey -> Draft)
  const [modifiedCheckpoints, setModifiedCheckpoints] = useState<
    Map<string, CheckpointStudioDraft>
  >(new Map());

  // Lưu nháp toàn cục các Nhân vật/Nghi phạm đã chỉnh sửa (charKey -> DbCaseCharacter)
  const [modifiedCharacters, setModifiedCharacters] = useState<
    Map<string, DbCaseCharacter>
  >(new Map());
  const [hasUnsavedCharacter, setHasUnsavedCharacter] = useState(false);

  const investigationCheckpoints = useMemo(() => {
    return rows.filter(
      (r) =>
        r.kind !== "indictment" &&
        r.kind !== "epilogue" &&
        !r.checkpoint_id.includes("indictment") &&
        !r.checkpoint_id.includes("epilogue"),
    );
  }, [rows]);


  // Live Checkpoints: kết hợp giữa rows, draft đang chỉnh sửa và modifiedCheckpoints
  // để Bảng điều tra (Board Canvas) cập nhật tức thì (0s delay) khi đổi display_mode, note_color, label, scale, v.v.
  const liveRows = useMemo(() => {
    return rows.map((r) => {
      const draftFromMap =
        modifiedCheckpoints.get(r.id) ||
        modifiedCheckpoints.get(r.checkpoint_id);
      const isCurrentDraft =
        draft &&
        (r.id === draft.id ||
          r.checkpoint_id === draft.checkpointId ||
          r.id === selectedId ||
          r.checkpoint_id === selectedId);

      const effectiveDraft = isCurrentDraft ? draft : draftFromMap;
      if (effectiveDraft) {
        return {
          ...r,
          title: effectiveDraft.title,
          board_config: effectiveDraft.boardConfig,
        };
      }
      return r;
    });
  }, [rows, draft, selectedId, modifiedCheckpoints]);

  // Hook Board Editor thống nhất
  const {
    isLoading: isBoardLoading,
    isSaving: isBoardSaving,
    hasUnsavedChanges: boardHasUnsavedChanges,
    displayPins,
    connections,
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    refreshBoardModel,
    handlePositionChange,
    handleConnectPins,
    handleDeleteConnection,
    handleSaveNode,
    handleDeleteNode,
    handleSaveAll: handleSaveBoardLayout,
    handleUndo,
    handleRedo,
    handleAdjustNodeTransform,
    handleAdjustNodeZIndex,
    handleUpdateNodeLocal,
  } = useBoardEditor(caseId, { checkpoints: liveRows, characters });

  const onAdjustNodeTransformUnified = useCallback(
    (pinId: string, deltaRot: number, deltaScale: number) => {
      handleAdjustNodeTransform(pinId, deltaRot, deltaScale);

      const pin = displayPins.find((p) => p.id === pinId);
      const cpId = pin?.checkpointId;
      const sKey = pin?.subjectKey;
      const isFollowup =
        pin?.nodeKind === "followup" ||
        pinId.includes(":followup:") ||
        pinId.startsWith("followup-");

      // Tìm targetCp theo thứ tự ưu tiên chuẩn xác tuyệt đối:
      // 1. Khớp theo cpId / pinId trực tiếp
      let targetCp = rows.find(
        (r) =>
          r.id === pinId ||
          r.checkpoint_id === pinId ||
          (cpId && (r.id === cpId || r.checkpoint_id === cpId)),
      );

      // 2. Nếu là pin Nghi vấn (followup), BẮT BUỘC chỉ tìm checkpoint loại followup
      if (!targetCp && isFollowup) {
        targetCp = rows.find((r) => {
          const isF =
            r.kind === "followup" ||
            isAnswerKind(r.kind) ||
            r.checkpoint_id.toLowerCase().includes("followup") ||
            Boolean(r.followup_of);
          if (!isF) return false;
          if (sKey && r.subject_key && r.subject_key.toLowerCase() === sKey.toLowerCase()) return true;
          if (sKey && r.checkpoint_id.toLowerCase().includes(sKey.toLowerCase())) return true;
          return false;
        });
      }

      // 3. Nếu là pin Nghi phạm (suspect), tìm checkpoint suspect_interrogation
      if (!targetCp && (pin?.nodeKind === "suspect" || pinId.includes(":suspect:"))) {
        targetCp = rows.find((r) => {
          if (r.kind !== "suspect_interrogation") return false;
          if (sKey && r.subject_key && r.subject_key.toLowerCase() === sKey.toLowerCase()) return true;
          if (sKey && r.checkpoint_id.toLowerCase().includes(sKey.toLowerCase())) return true;
          return false;
        });
      }

      // 4. Fallback dò subject_key / substring nếu vẫn chưa tìm thấy
      if (!targetCp) {
        targetCp = rows.find(
          (r) =>
            (sKey &&
              (r.subject_key === sKey ||
                (r.checkpoint_id &&
                  (r.checkpoint_id.endsWith(`-${sKey}`) ||
                    r.checkpoint_id.endsWith(`:${sKey}`) ||
                    r.checkpoint_id.includes(`-${sKey}-`) ||
                    r.checkpoint_id.includes(`:${sKey}:`))))) ||
            (pinId && r.checkpoint_id && pinId.includes(r.checkpoint_id)),
        );
      }

      if (targetCp) {
        const curCfg = ((targetCp.board_config as BoardConfig) || {}) as BoardConfig;
        const curRot = typeof curCfg.rotation === "number" ? curCfg.rotation : 0;
        const curScale = typeof curCfg.scale === "number" && curCfg.scale > 0 ? curCfg.scale : 1.0;
        const nextRot = Math.round(curRot + deltaRot);
        const nextScale = Math.max(0.4, Math.min(2.5, Math.round((curScale + deltaScale) * 10) / 10));

        const updatedBoardConfig: BoardConfig = {
          ...curCfg,
          rotation: nextRot,
          scale: nextScale,
        };

        setRows((prev) =>
          prev.map((r) =>
            r.id === targetCp.id ? { ...r, board_config: updatedBoardConfig } : r,
          ),
        );

        const targetKey = targetCp.id || targetCp.checkpoint_id;
        setModifiedCheckpoints((prev) => {
          const nextMap = new Map(prev);
          const existing = nextMap.get(targetKey) || toDraft(targetCp);
          nextMap.set(targetKey, { ...existing, boardConfig: updatedBoardConfig });
          return nextMap;
        });

        if (draft && (draft.id === targetCp.id || draft.checkpointId === targetCp.checkpoint_id)) {
          setDraft((d) => (d ? { ...d, boardConfig: updatedBoardConfig } : d));
        }
      }
    },
    [handleAdjustNodeTransform, displayPins, rows, draft],
  );

  useEffect(() => {
    let cancelled = false;
    getCharactersByCase(caseId)
      .then((res) => {
        if (!cancelled && res.success && res.data) {
          setCharacters(res.data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const lintResult = useMemo(() => {
    return lintCase({
      checkpoints: rows,
      characters,
      availableEvidenceCodes: availableDocs.map((d) => d.code),
    });
  }, [rows, characters, availableDocs]);

  const handlePlaytest = (checkpointId?: string) => {
    const targetCp = checkpointId
      ? rows.find((r) => r.checkpoint_id === checkpointId)
      : rows[0];
    if (targetCp) {
      launchPlaytestFromCheckpoint({
        caseId,
        targetCheckpoint: targetCp,
        allCheckpoints: rows,
      });
      toast.success("Đang mở màn chơi thử nghiệm");
    } else {
      window.open(boardPath(caseId), "_blank");
    }
  };

  const currentSelectCheckpointId = useMemo(() => {
    if (inspectorTab !== "checkpoints") return "";
    const matched = investigationCheckpoints.find(
      (r) =>
        (selectedId &&
          (r.id === selectedId || r.checkpoint_id === selectedId)) ||
        (draft &&
          (r.id === draft.id || r.checkpoint_id === draft.checkpointId)),
    );
    if (matched) return matched.id || matched.checkpoint_id;
    if (
      draft &&
      !draft.id &&
      draft.kind !== "indictment" &&
      draft.kind !== "epilogue"
    )
      return "__new__";
    return "";
  }, [investigationCheckpoints, selectedId, draft, inspectorTab]);

  const formDirty = useMemo(
    () => (draft ? JSON.stringify(draft) !== baseline : false),
    [draft, baseline],
  );

  const hasAnyUnsaved =
    formDirty ||
    modifiedCheckpoints.size > 0 ||
    modifiedCharacters.size > 0 ||
    hasUnsavedCharacter ||
    boardHasUnsavedChanges;
  const hasUnsaved = hasAnyUnsaved;

  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);





  const selectRow = (row: DbCaseCheckpoint): boolean => {
    const isSpecialIndictment =
      row.kind === "indictment" || row.checkpoint_id.includes("indictment");
    const isSpecialEpilogue =
      row.kind === "epilogue" || row.checkpoint_id.includes("epilogue");

    if (row.id === selectedId && draft) {
      if (isSpecialIndictment) setInspectorTab("indictment");
      else if (isSpecialEpilogue) setInspectorTab("epilogue");
      else setInspectorTab("checkpoints");
      return true;
    }

    // Tự động lưu nháp checkpoint hiện tại nếu có thay đổi mà KHÔNG hiện popup hỏi
    if (draft) {
      const curKey = draft.id || draft.checkpointId;
      if (curKey && JSON.stringify(draft) !== baseline) {
        setModifiedCheckpoints((prev) => {
          const nextMap = new Map(prev);
          nextMap.set(curKey, draft);
          return nextMap;
        });
      }
    }

    // Nạp draft: nếu checkpoint mục tiêu đã có bản nháp đang sửa dở thì lấy bản nháp đó
    const targetKey = row.id || row.checkpoint_id;
    const existingDraft =
      modifiedCheckpoints.get(targetKey) ||
      modifiedCheckpoints.get(row.id) ||
      modifiedCheckpoints.get(row.checkpoint_id);
    const nextDraft = existingDraft ? { ...existingDraft } : toDraft(row);

    setSelectedId(row.id);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(toDraft(row)));
    if (isSpecialIndictment) setInspectorTab("indictment");
    else if (isSpecialEpilogue) setInspectorTab("epilogue");
    else setInspectorTab("checkpoints");
    return true;
  };

  const handleOpenSpecialCheckpoint = (kind: "indictment" | "epilogue") => {
    setSelectedCharacter(null);
    setSelectedNodeId(null);
    setInspectorTab(kind);

    if (draft) {
      const curKey = draft.id || draft.checkpointId;
      if (curKey && JSON.stringify(draft) !== baseline) {
        setModifiedCheckpoints((prev) => {
          const nextMap = new Map(prev);
          nextMap.set(curKey, draft);
          return nextMap;
        });
      }
    }

    const existing = rows.find(
      (r) => r.kind === kind || r.checkpoint_id.includes(kind),
    );
    if (existing) {
      const targetKey = existing.id || existing.checkpoint_id;
      const existingDraft =
        modifiedCheckpoints.get(targetKey) ||
        modifiedCheckpoints.get(existing.id) ||
        modifiedCheckpoints.get(existing.checkpoint_id);
      const nextDraft = existingDraft ? { ...existingDraft } : toDraft(existing);

      setSelectedId(existing.id);
      setDraft(nextDraft);
      setBaseline(JSON.stringify(toDraft(existing)));
    } else {
      const defaultId = `${caseId}-checkpoint-${kind}`;
      const newDraft: CheckpointStudioDraft = {
        ...createEmptyDraft(caseId),
        checkpointId: defaultId,
        title: kind === "indictment" ? "Kết luận" : "Hậu án",
        kind: kind,
        type: kind === "indictment" ? "evidence_picker" : "epilogue",
        question: kind === "indictment" ? "Bản kết luận điều tra" : "Hậu án",
        answerConfig:
          kind === "indictment"
            ? {
                validSuspects: [],
                validMotives: [],
                requiredEvidenceIds: [],
                optionalEvidenceIds: [],
                motiveEvidenceIds: [],
                optionalMotiveIds: [],
                contradictionEvidenceIds: [],
                optionalContradictionIds: [],
              }
            : {
                validSuspects: [],
                validMotives: [],
                requiredEvidenceIds: [],
                optionalEvidenceIds: [],
                motiveEvidenceIds: [],
                optionalMotiveIds: [],
                contradictionEvidenceIds: [],
                optionalContradictionIds: [],
                epilogueStories: [{ id: "story_1", title: "Phần 1", monologue: "" }],
              },
      };
      setDraft(newDraft);
      setSelectedId(null);
      setBaseline("");
    }
  };

  const createRow = () => {
    if (draft) {
      const curKey = draft.id || draft.checkpointId;
      if (curKey && JSON.stringify(draft) !== baseline) {
        setModifiedCheckpoints((prev) => {
          const nextMap = new Map(prev);
          nextMap.set(curKey, draft);
          return nextMap;
        });
      }
    }
    const nextDraft = createEmptyDraft(caseId);
    setSelectedId(null);
    setSelectedNodeId(null);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
    setSelectedCharacter(null);
    setInspectorTab("checkpoints");
  };


  const updateDraft = (patch: Partial<CheckpointStudioDraft>) => {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };

      const key = current.id || current.checkpointId;
      if (key) {
        setModifiedCheckpoints((prev) => {
          const nextMap = new Map(prev);
          nextMap.set(key, next);
          return nextMap;
        });
      }

      // Cập nhật live vào rows ngay lập tức để Canvas phản ánh theo thời gian thực (0s độ trễ)
      setRows((prevRows) => {
        const selectedDossier =
          patch.unlocksDossier !== undefined
            ? patch.unlocksDossier.trim()
            : next.unlocksDossier
              ? next.unlocksDossier.trim()
              : "";

        return prevRows.map((r) => {
          const isTarget =
            (current.id && r.id === current.id) ||
            r.checkpoint_id === current.checkpointId;

          if (isTarget) {
            return {
              ...r,
              title: next.title,
              type: next.type,
              kind: next.kind,
              subject_key: next.subjectKey || null,
              question: next.question,
              depends_on:
                next.dependsOn !== undefined ? next.dependsOn : r.depends_on,
              board_config:
                next.boardConfig !== undefined
                  ? next.boardConfig
                  : r.board_config,
              answer_config: {
                ...(r.answer_config as Record<string, unknown>),
                ...next.answerConfig,
                ...(patch.unlocksDossier !== undefined
                  ? { unlocksDossier: patch.unlocksDossier }
                  : {}),
              },
            };
          }

          const rConfig = r.answer_config as Record<string, unknown> | null;
          if (
            selectedDossier &&
            typeof rConfig?.unlocksDossier === "string" &&
            rConfig.unlocksDossier.trim() === selectedDossier
          ) {
            return {
              ...r,
              answer_config: {
                ...(r.answer_config as Record<string, unknown>),
                unlocksDossier: "",
              },
            };
          }

          return r;
        });
      });

      return next;
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    const effectiveTitle =
      draft.title.trim() ||
      (draft.kind === "epilogue"
        ? "Hậu án"
        : draft.kind === "indictment" || draft.type === "indictment"
          ? "Kết luận"
          : "");
    if (!effectiveTitle) {
      toast.error("Nhập tiêu đề checkpoint trước khi lưu.");
      return;
    }
    const draftToSave = draft.title.trim()
      ? draft
      : { ...draft, title: effectiveTitle };

    setIsSaving(true);
    try {
      const result = await saveCheckpoint(draftToSave);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const saved = result.data;
      setRows((current) => {
        const exists = current.some((row) => row.id === saved.id);
        const next = exists
          ? current.map((row) => (row.id === saved.id ? saved : row))
          : [...current, saved];
        return next.sort((a, b) =>
          a.checkpoint_id.localeCompare(b.checkpoint_id),
        );
      });

      const nextDraft = toDraft(saved);
      setSelectedId(saved.id);
      setDraft(nextDraft);
      setBaseline(JSON.stringify(nextDraft));
      toast.success("Đã lưu checkpoint.");
      await refreshBoardModel();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không lưu được checkpoint.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft?.id) return;
    if (
      !window.confirm(
        `Xóa checkpoint "${draft.title || draft.checkpointId}"? Thao tác này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await deleteCheckpoint(draft.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const deletedCheckpointId = draft.checkpointId;
      const remaining = rows
        .filter((row) => row.id !== draft.id)
        .map((row) => ({
          ...row,
          depends_on: (row.depends_on || []).filter(
            (dependency) => dependency !== deletedCheckpointId,
          ),
        }));
      setRows(remaining);
      const first = remaining[0] ?? null;
      const nextDraft = first ? toDraft(first) : null;
      setSelectedId(first?.id ?? null);
      setDraft(nextDraft);
      setBaseline(nextDraft ? JSON.stringify(nextDraft) : "");
      toast.success("Đã xóa checkpoint.");
      await refreshBoardModel();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không xóa được checkpoint.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const activeCharacterDraftRef = useRef<DbCaseCharacter | null>(null);
  const characterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCharacterLiveDraftChange = (updatedChar: DbCaseCharacter) => {
    activeCharacterDraftRef.current = updatedChar;
    setHasUnsavedCharacter(true);

    const charKey = updatedChar.id || updatedChar.key;
    if (charKey) {
      setModifiedCharacters((prev) => {
        const nextMap = new Map(prev);
        nextMap.set(charKey, updatedChar);
        return nextMap;
      });
    }

    // Debounce cập nhật lên state cha để gõ phím không bị lag giật toàn bộ canvas/pins
    if (characterDebounceTimerRef.current) {
      clearTimeout(characterDebounceTimerRef.current);
    }
    characterDebounceTimerRef.current = setTimeout(() => {
      setCharacters((prev) => {
        const exists = prev.some(
          (c) => c.id === updatedChar.id || c.key === updatedChar.key,
        );
        if (exists) {
          return prev.map((c) =>
            c.id === updatedChar.id || c.key === updatedChar.key
              ? updatedChar
              : c,
          );
        }
        return [...prev, updatedChar];
      });
    }, 200);
  };

  const [isUnifiedSaving, setIsUnifiedSaving] = useState(false);

  const handleSaveAllUnified = async () => {
    setIsUnifiedSaving(true);
    try {
      const promises: Promise<unknown>[] = [];

      // 1. Thu thập tất cả Checkpoint cần lưu:
      // Bao gồm tất cả bản ghi trong modifiedCheckpoints + draft hiện tại nếu dirty
      const checkpointsToSaveMap = new Map<string, CheckpointStudioDraft>();
      modifiedCheckpoints.forEach((val, k) => {
        checkpointsToSaveMap.set(k, val);
      });
      if (draft) {
        const curKey = draft.id || draft.checkpointId;
        if (curKey && JSON.stringify(draft) !== baseline) {
          checkpointsToSaveMap.set(curKey, draft);
        }
      }

      for (const cpDraft of Array.from(checkpointsToSaveMap.values())) {
        const effectiveTitle =
          cpDraft.title.trim() ||
          (cpDraft.kind === "epilogue"
            ? "Hậu án"
            : cpDraft.kind === "indictment" || cpDraft.type === "indictment"
              ? "Kết luận"
              : "");
        const toSave = cpDraft.title.trim()
          ? cpDraft
          : { ...cpDraft, title: effectiveTitle };

        promises.push(
          saveCheckpoint(toSave).then((res) => {
            if (!res.success) throw new Error(res.error);
            const saved = res.data;
            setRows((current) => {
              const exists = current.some((r) => r.id === saved.id);
              const next = exists
                ? current.map((r) => (r.id === saved.id ? saved : r))
                : [...current, saved];
              return next.sort((a, b) =>
                a.checkpoint_id.localeCompare(b.checkpoint_id),
              );
            });
          }),
        );
      }

      // 2. Thu thập tất cả Nhân vật/Nghi phạm cần lưu:
      const charactersToSaveMap = new Map<string, DbCaseCharacter>();
      modifiedCharacters.forEach((val, k) => {
        charactersToSaveMap.set(k, val);
      });
      const activeChar =
        activeCharacterDraftRef.current ||
        (inspectorTab === "characters" ? selectedCharacter : null);
      if (activeChar && (hasUnsavedCharacter || activeChar.id?.startsWith("temp_"))) {
        const key = activeChar.id || activeChar.key;
        charactersToSaveMap.set(key, activeChar);
      }

      const charactersList = Array.from(charactersToSaveMap.values());
      if (charactersList.length > 0) {
        const { saveCharacter } = await import("@/lib/actions/character-actions");
        for (const charToSave of charactersList) {
          if (!charToSave.name?.trim()) continue;
          promises.push(
            saveCharacter({
              id: charToSave.id?.startsWith("temp_") ? undefined : charToSave.id,
              caseId,
              key: charToSave.key,
              name: charToSave.name.trim(),
              aliases: charToSave.aliases || [],
              role: charToSave.role,
              description: charToSave.description || "",
              avatarCode: charToSave.avatar_code || ("avatar_" + charToSave.key),
              avatarUrl: charToSave.avatar_url || null,
              avatarAssetPath: charToSave.avatar_asset_path || null,
              phones: charToSave.phones || [],
              slotIndex: charToSave.slot_index ?? characters.length,
              device: charToSave.device || null,
            }).then((res) => {
              if (!res.success) throw new Error(res.error || "Lỗi khi lưu nhân vật");
              const realChar = res.data;
              setCharacters((prev) =>
                prev.map((c) =>
                  c.id === charToSave.id || c.key === charToSave.key ? realChar : c,
                ),
              );
            }),
          );
        }
      }

      // 2b. Lưu Thẩm tra nghi phạm gắn liền nếu có thay đổi
      if (activeInterrogationDraftRef.current) {
        const interrogation = activeInterrogationDraftRef.current;
        const toSave = interrogation.id?.startsWith("temp_")
          ? { ...interrogation, id: "" }
          : interrogation;
        promises.push(
          saveCheckpoint(toSave).then((res) => {
            if (!res.success) throw new Error(res.error);
            activeInterrogationDraftRef.current = null;
            setRows((prev) => [
              ...prev.filter(
                (r) =>
                  r.id !== interrogation.id &&
                  r.checkpoint_id !== res.data.checkpoint_id,
              ),
              res.data,
            ]);
          }),
        );
      }

      // 3. Lưu bố cục bảng điều tra (tọa độ ghim, xoay, scale, dây nối)
      promises.push(handleSaveBoardLayout());

      await Promise.all(promises);

      // Xóa sạch trạng thái dirty toàn cục
      setModifiedCheckpoints(new Map());
      setModifiedCharacters(new Map());
      setHasUnsavedCharacter(false);
      activeCharacterDraftRef.current = null;
      if (draft) {
        setBaseline(JSON.stringify(draft));
      }

      toast.success("Đã lưu toàn bộ thay đổi thành công!");
      await refreshBoardModel();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Lỗi khi lưu dữ liệu");
    } finally {
      setIsUnifiedSaving(false);
    }
  };

  // Lắng nghe Ctrl+S (Lưu) và Ctrl+Z (Undo) / Ctrl+Y, Ctrl+Shift+Z (Redo) toàn cục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (!isCmdOrCtrl) return;

      const key = e.key.toLowerCase();

      // 1. Phím tắt Ctrl + S: Lưu toàn bộ
      if (key === "s") {
        e.preventDefault();
        handleSaveAllUnified();
        return;
      }

      // Kiểm tra nếu đang focus trong input/textarea thì giữ nguyên native browser undo text
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isInputFocused) return;

      // 2. Phím tắt Ctrl + Shift + Z hoặc Ctrl + Y: Làm lại (Redo)
      if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      // 3. Phím tắt Ctrl + Z: Hoàn tác (Undo)
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    formDirty,
    draft,
    hasUnsavedCharacter,
    handleSaveBoardLayout,
    handleUndo,
    handleRedo,
  ]);

  const activeInterrogationDraftRef = useRef<CheckpointStudioDraft | null>(
    null,
  );

  const handleCharacterInterrogationChange = (
    interrogationDraft: CheckpointStudioDraft,
  ) => {
    activeInterrogationDraftRef.current = interrogationDraft;

    // Cập nhật live vào rows để Flow View phản ánh ngay lập tức
    setRows((prevRows) => {
      const exists = prevRows.some(
        (r) =>
          (interrogationDraft.id && r.id === interrogationDraft.id) ||
          r.checkpoint_id === interrogationDraft.checkpointId ||
          (interrogationDraft.subjectKey &&
            r.subject_key === interrogationDraft.subjectKey),
      );

      if (exists) {
        return prevRows.map((r) => {
          const isTarget =
            (interrogationDraft.id && r.id === interrogationDraft.id) ||
            r.checkpoint_id === interrogationDraft.checkpointId ||
            (interrogationDraft.subjectKey &&
              r.subject_key === interrogationDraft.subjectKey);
          if (isTarget) {
            return {
              ...r,
              title: interrogationDraft.title,
              kind: "suspect_interrogation",
              type: "evidence_picker",
              subject_key: interrogationDraft.subjectKey || r.subject_key,
              question: interrogationDraft.question,
              answer_config: interrogationDraft.answerConfig as any,
              hints: interrogationDraft.hints as any,
            };
          }
          return r;
        });
      }

      // Nếu chưa có, thêm mới vào rows
      const newRow: DbCaseCheckpoint = {
        id: interrogationDraft.id || "temp_" + interrogationDraft.checkpointId,
        case_id: caseId,
        checkpoint_id: interrogationDraft.checkpointId,
        node_id: null,
        dossier: null,
        title: interrogationDraft.title,
        question: interrogationDraft.question,
        type: "evidence_picker",
        kind: "suspect_interrogation",
        subject_key: interrogationDraft.subjectKey || null,
        question_type: null,
        followup_of: null,
        depends_on: [],
        flow_position: null,
        answer_config: interrogationDraft.answerConfig as any,
        hints: interrogationDraft.hints as any,
        narrative: null,
        ai_context: null,
        ai_valid_cases: null,
        ai_invalid_cases: null,
        board_config: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return [...prevRows, newRow];
    });
  };

  const handleCreateNewCharacter = () => {
    const tempKey = "char_" + Date.now().toString(36);
    const newChar: DbCaseCharacter = {
      id: "temp_" + tempKey,
      case_slug: caseId,
      key: tempKey,
      name: "",
      role: "witness",
      avatar_url: null,
      avatar_code: `avatar_${tempKey}`,
      avatar_asset_path: null,
      phones: [],
      aliases: [],
      description: "",
      slot_index: characters.length,
      device: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSelectedCharacter(newChar);
    activeCharacterDraftRef.current = newChar;
    setHasUnsavedCharacter(true);
    setCharacters((prev) => [...prev, newChar]);
    setInspectorTab("characters");
    setSelectedNodeId(null);
  };

  const handleSaveCharacter = async (savedChar: DbCaseCharacter) => {
    try {
      const isTemp = savedChar.id?.startsWith("temp_");
      const { saveCharacter } = await import("@/lib/actions/character-actions");
      const res = await saveCharacter({
        id: isTemp ? undefined : savedChar.id,
        caseId,
        key: savedChar.key,
        name: savedChar.name.trim(),
        aliases: savedChar.aliases || [],
        role: savedChar.role,
        description: savedChar.description || "",
        avatarCode: savedChar.avatar_code || `avatar_${savedChar.key}`,
        avatarUrl: savedChar.avatar_url || null,
        avatarAssetPath: savedChar.avatar_asset_path || null,
        phones: savedChar.phones || [],
        slotIndex: savedChar.slot_index ?? characters.length,
        device: savedChar.device || null,
      });

      if (!res.success) {
        toast.error(res.error || "Không thể lưu nhân vật");
        return;
      }

      const realChar = res.data;
      setCharacters((prev) => {
        const filtered = prev.filter(
          (c) => c.id !== savedChar.id && c.key !== savedChar.key,
        );
        return [...filtered, realChar];
      });
      setSelectedCharacter(realChar);
      activeCharacterDraftRef.current = realChar;
      setHasUnsavedCharacter(false);
      toast.success(`Đã lưu nhân vật "${realChar.name}"`);
      await refreshBoardModel();
    } catch (err: unknown) {
      console.error("Lỗi khi lưu nhân vật:", err);
      toast.error("Lỗi khi lưu thông tin nhân vật");
    }
  };

  const handleDeleteCharacter = async (charId: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== charId));
    setSelectedCharacter(null);
    setInspectorTab("checkpoints");
    await refreshBoardModel();
  };


  const handleSelectFromFlow = (cp: DbCaseCheckpoint) => {
    setInspectorTab("checkpoints");
    setSelectedCharacter(null);
    selectRow(cp);
    const matchingPin = displayPins.find(
      (p) =>
        p.checkpointId === cp.checkpoint_id ||
        (cp.checkpoint_id.includes("phone") && p.nodeKind === "phone_lookup") ||
        (cp.checkpoint_id.includes("indictment") &&
          p.nodeKind === "indictment") ||
        p.id.includes(cp.checkpoint_id),
    );
    if (matchingPin) {
      setSelectedNodeId(matchingPin.id);
    } else {
      setSelectedNodeId(null);
    }
  };

  const {
    handleConnectDependencyFromFlow,
    handleDeleteDependencyFromFlow,
    handleFlowNodePositionChange,
  } = useFlowDependencies({ caseId, rows, setRows, draft, setDraft });

  const handleSelectPinOnBoard = (pinId: string | null) => {
    setSelectedNodeId(pinId);
    if (!pinId) return;

    const pin = displayPins.find((p) => p.id === pinId);
    if (!pin) return;

    // 0. Tang vật điện thoại nạn nhân (Device Evidence) - không can thiệp inspector
    if (
      pin.nodeKind === "victim_phone" ||
      pin.id.includes("victim_phone") ||
      pin.id.includes("victim-phone")
    ) {
      return;
    }

    // 0.1. Node chức năng Bảng: suspects_hub (Danh sách Nghi phạm), reinvestigate (Khám xét)
    if (
      pin.nodeKind === "suspects_hub" ||
      pin.id.includes("suspects_hub") ||
      pin.id.includes("c0-pin-suspects")
    ) {
      setSelectedNodeId(pin.id);
      return;
    }

    // 1. Nếu pin có checkpointId
    if (pin.checkpointId) {
      const cp = rows.find(
        (r) =>
          r.id === pin.checkpointId || r.checkpoint_id === pin.checkpointId,
      );
      if (cp) {
        setInspectorTab("checkpoints");
        setSelectedCharacter(null);
        selectRow(cp);
        return;
      }
    }

    // 1.1. Node Nghi vấn mở rộng (followup) - đảm bảo chọn đúng checkpoint followup
    if (
      pin.nodeKind === "followup" ||
      pin.id.includes(":followup:") ||
      pin.id.startsWith("followup-")
    ) {
      const sKey = pin.subjectKey;
      const cp = rows.find(
        (r) =>
          (r.kind === "followup" ||
            isAnswerKind(r.kind) ||
            r.checkpoint_id.toLowerCase().includes("followup") ||
            Boolean(r.followup_of)) &&
          ((sKey && r.subject_key?.toLowerCase() === sKey.toLowerCase()) ||
            (sKey && r.checkpoint_id.toLowerCase().includes(sKey.toLowerCase()))),
      );
      if (cp) {
        setInspectorTab("checkpoints");
        setSelectedCharacter(null);
        selectRow(cp);
        return;
      }
    }

    // 2. Tìm theo nodeKind đặc thù của checkpoint
    if (pin.nodeKind === "phone_lookup") {
      const cp = rows.find((r) => r.kind === "phone_lookup");
      if (cp) {
        setInspectorTab("checkpoints");
        setSelectedCharacter(null);
        selectRow(cp);
        return;
      }
    }

    if (pin.nodeKind === "suspect" && pin.subjectKey) {
      const matchedChar = characters.find(
        (c) =>
          c.key.toLowerCase() === pin.subjectKey?.toLowerCase() ||
          pin.id.includes(c.key.toLowerCase()),
      );
      if (matchedChar) {
        setSelectedCharacter(matchedChar);
        setInspectorTab("characters");
      }
      const cp = rows.find(
        (r) =>
          (r.kind === "suspect_interrogation" ||
            (r as any).type === "suspect_interrogation") &&
          r.subject_key === pin.subjectKey,
      );
      if (cp) {
        selectRow(cp);
      }
      return;
    }

    if (pin.nodeKind === "victim") {
      const victimChar =
        (pin.subjectKey &&
          characters.find((c) => c.key === pin.subjectKey)) ||
        characters.find((c) => c.role === "victim");
      if (victimChar) {
        setSelectedCharacter(victimChar);
        setInspectorTab("characters");
        return;
      }
    }

    if (pin.nodeKind === "followup" || pin.id.includes(":followup:")) {
      const sKey = pin.subjectKey?.toLowerCase().trim();
      const cp = rows.find((r) => {
        const isFollowupRow =
          r.kind === "followup" ||
          r.checkpoint_id?.toLowerCase().includes("followup");
        if (!isFollowupRow) return false;
        if (!sKey) return true;
        if (r.subject_key?.toLowerCase().trim() === sKey) return true;
        const cId = (r.checkpoint_id || "").toLowerCase();
        return (
          cId.endsWith(`-${sKey}`) ||
          cId.endsWith(`:${sKey}`) ||
          cId.includes(`:${sKey}:`) ||
          cId.includes(`-${sKey}-`)
        );
      });
      if (cp) {
        setInspectorTab("checkpoints");
        setSelectedCharacter(null);
        selectRow(cp);
        return;
      }
    }

    if (pin.nodeKind === "indictment" || pin.id.includes("indictment")) {
      handleOpenSpecialCheckpoint("indictment");
      return;
    }

    if (pin.nodeKind === "epilogue" || pin.id.includes("epilogue")) {
      handleOpenSpecialCheckpoint("epilogue");
      return;
    }

    // 3. Nếu là custom node (không gắn checkpoint)
    if (pin.id.includes(":custom:") || pin.nodeKind === "custom") {
      setDraft(null);
      setSelectedId(null);
    }
  };



  const isEditingBoardNode = Boolean(
    selectedNode &&
    !("checkpoint_id" in selectedNode && selectedNode.checkpoint_id) &&
    (selectedNode.id.includes(":suspects_hub:") ||
      selectedNode.id.includes(":custom:") ||
      selectedNode.id.includes(":reinvestigate:") ||
      selectedNode.id.includes("c0-pin-suspects") ||
      ("node_kind" in selectedNode &&
        (selectedNode.node_kind === "suspects_hub" ||
          selectedNode.node_kind === "custom" ||
          selectedNode.node_kind === "reinvestigate")) ||
      ("nodeKind" in selectedNode &&
        (selectedNode.nodeKind === "suspects_hub" ||
          selectedNode.nodeKind === "custom" ||
          selectedNode.nodeKind === "reinvestigate"))),
  );

  const isBusy = isBoardLoading || isSaving || isBoardSaving;

  return (
    <div
      data-studio-ready={isBusy ? "false" : "true"}
      className="flex h-full min-h-0 w-full flex-col bg-[#0c0d12]"
    >
      {/* 1. Header Toolbar của Checkpoint Studio & Board Studio gộp */}
      <CheckpointStudioHeader
  hasUnsaved={hasUnsaved}
  createRow={createRow}
  handleCreateNewCharacter={handleCreateNewCharacter}
  handlePlaytest={handlePlaytest}
  draft={draft}
  setIsFloatingBoardOpen={setIsFloatingBoardOpen}
  isFloatingBoardOpen={isFloatingBoardOpen}
  handleSaveAllUnified={handleSaveAllUnified}
  isBusy={isBusy}
  isUnifiedSaving={isUnifiedSaving}
  hasAnyUnsaved={hasAnyUnsaved}
  setIsLintModalOpen={setIsLintModalOpen}
  lintResult={lintResult}
/>

      {/* 2. Main Workspace: Canvas Sơ đồ luồng toàn màn hình + Bảng điều tra nổi (Floating Resizable) + Inspector */}
      <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row overflow-hidden relative">
        {/* VÙNG CHÍNH: Sơ đồ luồng Flow toàn màn hình */}
        <div className="flex-1 min-h-0 min-w-0 relative h-full w-full bg-[#0d0d12] overflow-hidden">
          <CheckpointFlowView
            rows={rows}
            selectedId={selectedId || draft?.id || draft?.checkpointId || null}
            onSelectCheckpoint={handleSelectFromFlow}
            onCreateCheckpoint={createRow}
            onConnectDependencies={handleConnectDependencyFromFlow}
            onDeleteDependency={handleDeleteDependencyFromFlow}
            onNodePositionChange={handleFlowNodePositionChange}
            className="w-full h-full"
          />

          {/* Cửa sổ nổi Bảng điều tra (Kéo di chuyển, Phóng to/Thu nhỏ & Resize tự do) */}
          <FloatingBoardPanel
            caseId={caseId}
            displayPins={displayPins}
            activeConnections={connections}
            selectedNodeId={selectedNodeId}
            selectedNode={selectedNode}
            isOpen={isFloatingBoardOpen}
            onClose={() => setIsFloatingBoardOpen(false)}
            onSelectPin={handleSelectPinOnBoard}
            onPinPositionChange={handlePositionChange}
            onConnectPins={handleConnectPins}
            onDeleteConnection={handleDeleteConnection}
            onAdjustNodeTransform={onAdjustNodeTransformUnified}
            onAdjustNodeZIndex={handleAdjustNodeZIndex}
          />
        </div>

        {/* Đường viền kéo dãn độ rộng sidebar bên phải */}
        <div
          onMouseDown={startResizing}
          className={cn(
            "hidden md:block relative z-30 w-1 -mr-0.5 cursor-col-resize select-none shrink-0 bg-white/10 transition-colors hover:bg-amber-400 active:bg-amber-500",
            isResizing && "bg-amber-500",
          )}
          title="Kéo sang trái/phải để điều chỉnh độ rộng"
        />

        {/* Hộp biên tập Inspector bên phải */}
        <CheckpointStudioInspector
  sidebarWidth={sidebarWidth}
  isResizing={isResizing}
  isEditingBoardNode={isEditingBoardNode}
  selectedNode={selectedNode}
  caseId={caseId}
  handleSaveNode={handleSaveNode}
  handleDeleteNode={handleDeleteNode}
  setSelectedNodeId={setSelectedNodeId}
  handleUpdateNodeLocal={handleUpdateNodeLocal}
  setInspectorTab={setInspectorTab}
  setSelectedCharacter={setSelectedCharacter}
  draft={draft}
  investigationCheckpoints={investigationCheckpoints}
  selectRow={selectRow}
  inspectorTab={inspectorTab}
  selectedCharacter={selectedCharacter}
  characters={characters}
  handleOpenSpecialCheckpoint={handleOpenSpecialCheckpoint}
  currentSelectCheckpointId={currentSelectCheckpointId}
  rows={rows}
  handleSaveCharacter={handleSaveCharacter}
  handleDeleteCharacter={handleDeleteCharacter}
  handleCharacterLiveDraftChange={handleCharacterLiveDraftChange}
  handleCharacterInterrogationChange={handleCharacterInterrogationChange}
  dossiers={dossiers}
  availableDocs={availableDocs}
  updateDraft={updateDraft}
  handleSave={handleSave}
  handleDelete={handleDelete}
  handlePlaytest={handlePlaytest}
  isSaving={isSaving}
  formDirty={formDirty}
/>
      </div>

      {/* Modal Case Linter */}
      <CaseLintModal
        isOpen={isLintModalOpen}
        onClose={() => setIsLintModalOpen(false)}
        result={lintResult}
        onSelectCheckpoint={(cpId) => {
          const row = rows.find((r) => r.checkpoint_id === cpId);
          if (row) selectRow(row);
        }}
      />
    </div>
  );
}
