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
  getCheckpointsByCase,
  saveCheckpoint,
  updateCheckpointDependencies,
} from "@/lib/actions/checkpoint-actions";
import { updateCheckpointBoardConfig } from "@/lib/actions/board-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import {
  buildDependencyEdges,
  wouldCreateCycle,
} from "@/lib/cms/checkpoint-graph";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CheckpointListSidebar } from "./checkpoint-list-sidebar";
import { CheckpointEditor } from "./checkpoint-editor";
import { CheckpointFlowView } from "./checkpoint-flow-view";
import { CharacterEditor } from "./character-editor";
import { OffBoardTray } from "./off-board-tray";
import {
  HeroInteractive,
  type CaseConnection,
} from "@/components/investigation/hero-interactive";
import { useBoardEditor } from "./board/use-board-editor";
import { BoardNodeForm } from "./board/board-node-form";
import { Button } from "@/components/ui/button";
import {
  Users,
  Save,
  Plus,
  Play,
  RotateCcw,
  RotateCw,
  Minus,
  Sparkles,
  Layers,
} from "lucide-react";

interface CheckpointStudioClientProps {
  initialCaseId?: string;
  initialCases?: DbCase[];
  initialRows?: DbCaseCheckpoint[];
  initialDossiers?: DbCaseDossier[];
  initialAvailableDocuments?: AvailableDocumentItem[];
  initialCharacters?: DbCaseCharacter[];
  initialView?: "flow" | "board";
}

export function CheckpointStudioClient({
  initialCaseId = "case_000",
  initialCases = [],
  initialRows = [],
  initialDossiers = [],
  initialAvailableDocuments = [],
  initialCharacters = [],
  initialView = "flow",
}: CheckpointStudioClientProps) {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [activeView, setActiveView] = useState<"flow" | "board">(initialView);

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

  const [flowWidth, setFlowWidth] = useState<number>(440);
  useEffect(() => {
    const saved = Number(
      localStorage.getItem("checkpoint_studio_flow_width"),
    );
    if (saved) setFlowWidth(Math.max(300, Math.min(800, saved)));
  }, []);
  const [isResizingFlow, setIsResizingFlow] = useState(false);

  const startResizingFlow = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingFlow(true);
  }, []);

  useEffect(() => {
    if (!isResizingFlow) return;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 800) {
        setFlowWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingFlow(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        localStorage.setItem(
          "checkpoint_studio_flow_width",
          String(flowWidth),
        );
      } catch {}
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingFlow, flowWidth]);

  const [sidebarWidth, setSidebarWidth] = useState<number>(420);
  useEffect(() => {
    const saved = Number(
      localStorage.getItem("checkpoint_studio_sidebar_width"),
    );
    if (saved) setSidebarWidth(Math.max(320, Math.min(800, saved)));
  }, []);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 320 && newWidth <= 900) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        localStorage.setItem(
          "checkpoint_studio_sidebar_width",
          String(sidebarWidth),
        );
      } catch {}
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const router = useRouter();
  const [allCases, setAllCases] = useState<DbCase[]>(initialCases);
  const [rows, setRows] = useState<DbCaseCheckpoint[]>(initialRows);
  const [dossiers, setDossiers] = useState<DbCaseDossier[]>(initialDossiers);
  const [availableDocs, setAvailableDocs] = useState<AvailableDocumentItem[]>(
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
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<DbCaseCharacter[]>(initialCharacters);
  const [isLintModalOpen, setIsLintModalOpen] = useState(false);
  const [isCreatingCustomNode, setIsCreatingCustomNode] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"checkpoints" | "characters">("checkpoints");
  const [selectedCharacter, setSelectedCharacter] = useState<DbCaseCharacter | null>(null);

  // Chế độ "Lớp logic" (Logic Overlay)
  const [isLogicLayerActive, setIsLogicLayerActive] = useState(false);

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
    canUndo,
    canRedo,
    handleAdjustNodeTransform,
  } = useBoardEditor(caseId, { checkpoints: rows, characters });

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
      window.open(`/evidence/web?case_id=${caseId}`, "_blank");
    }
  };

  const generalCheckpoints = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.kind !== "suspect_interrogation" &&
          r.type !== "evidence_picker" &&
          !r.checkpoint_id.includes("interrogation"),
      ),
    [rows],
  );

  const formDirty = useMemo(
    () => (draft ? JSON.stringify(draft) !== baseline : false),
    [draft, baseline],
  );

  const hasUnsaved = formDirty || boardHasUnsavedChanges;

  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  const caseOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of allCases) {
      map.set(item.slug, item.title);
    }
    if (!map.has(caseId)) {
      const currentCase = allCases.find((c) => c.slug === caseId);
      map.set(caseId, currentCase?.title || caseId);
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [allCases, caseId]);

  const confirmDiscardForm = useCallback(() => {
    if (!formDirty) return true;
    return window.confirm(
      "Checkpoint có thay đổi chưa lưu. Bỏ các thay đổi này?",
    );
  }, [formDirty]);

  const confirmDiscardAll = useCallback(() => {
    if (!hasUnsaved) return true;
    return window.confirm(
      "Có thay đổi chưa lưu ở checkpoint hoặc bố cục bảng. Bỏ tất cả thay đổi này?",
    );
  }, [hasUnsaved]);

  const loadCase = useCallback(async (nextCaseId: string) => {
    setIsLoading(true);
    try {
      const [cpRes, dossierList, docsList, charsRes] = await Promise.all([
        getCheckpointsByCase(nextCaseId),
        getCaseDossiers(nextCaseId),
        getAllCaseDocumentsCatalog(nextCaseId),
        getCharactersByCase(nextCaseId),
      ]);
      if (!cpRes.success) {
        toast.error(cpRes.error);
        return;
      }
      setRows(cpRes.data);
      setDossiers(dossierList);
      setAvailableDocs(docsList);
      if (charsRes.success && charsRes.data) {
        setCharacters(charsRes.data);
      }
      const first = cpRes.data[0] ?? null;
      setSelectedId(first?.id ?? null);
      const nextDraft = first ? toDraft(first) : null;
      setDraft(nextDraft);
      setBaseline(nextDraft ? JSON.stringify(nextDraft) : "");
      setSelectedNodeId(null);
    } finally {
      setIsLoading(false);
    }
  }, [setSelectedNodeId]);

  const selectRow = (row: DbCaseCheckpoint): boolean => {
    if (row.id === selectedId && draft) return true;
    if (!confirmDiscardForm()) return false;
    const nextDraft = toDraft(row);
    setSelectedId(row.id);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
    return true;
  };

  const createRow = () => {
    if (!confirmDiscardForm()) return;
    const nextDraft = createEmptyDraft(caseId);
    setSelectedId(null);
    setSelectedNodeId(null);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
  };

  const changeCase = async (nextCaseId: string) => {
    if (nextCaseId === caseId) return;
    if (!confirmDiscardAll()) return;
    setCaseId(nextCaseId);
    setSelectedId(null);
    setDraft(null);
    setBaseline("");
    setSelectedNodeId(null);
    await loadCase(nextCaseId);
  };

  const updateDraft = (patch: Partial<CheckpointStudioDraft>) => {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };

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
              board_config: next.boardConfig || r.board_config,
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
      draft.title.trim() || (draft.kind === "epilogue" ? "Hậu án" : "");
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

  const [hasUnsavedCharacter, setHasUnsavedCharacter] = useState(false);
  const activeCharacterDraftRef = useRef<DbCaseCharacter | null>(null);

  const handleCharacterLiveDraftChange = (updatedChar: DbCaseCharacter) => {
    activeCharacterDraftRef.current = updatedChar;
    setHasUnsavedCharacter(true);

    // Cập nhật ngay lập tức vào state characters để Bảng điều tra và Khay ngoài bảng nhảy tức thì (0s độ trễ)
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === updatedChar.id || c.key === updatedChar.key);
      if (exists) {
        return prev.map((c) =>
          c.id === updatedChar.id || c.key === updatedChar.key ? updatedChar : c,
        );
      }
      return [...prev, updatedChar];
    });
  };

  const [isUnifiedSaving, setIsUnifiedSaving] = useState(false);

  const handleSaveAllUnified = async () => {
    setIsUnifiedSaving(true);
    try {
      const promises: Promise<unknown>[] = [];

      // 1. Lưu Checkpoint nếu có thay đổi
      if (formDirty && draft) {
        promises.push(handleSave());
      }

      // 2. Lưu Nhân vật nếu có thay đổi
      if (hasUnsavedCharacter && activeCharacterDraftRef.current) {
        const charToSave = activeCharacterDraftRef.current;
        const { saveCharacter } = await import("@/lib/actions/character-actions");
        promises.push(
          saveCharacter({
            id: charToSave.id?.startsWith("temp_") ? undefined : charToSave.id,
            caseId,
            key: charToSave.key,
            name: charToSave.name,
            aliases: charToSave.aliases || [],
            role: charToSave.role,
            description: charToSave.description || "",
            avatarCode: charToSave.avatar_code || `avatar_${charToSave.key}`,
            avatarUrl: charToSave.avatar_url || null,
            avatarAssetPath: charToSave.avatar_asset_path || null,
            phones: charToSave.phones || [],
            slotIndex: charToSave.slot_index ?? characters.length,
            device: charToSave.device || null,
          }).then((res) => {
            if (res.success && res.data) {
              setCharacters((prev) =>
                prev.map((c) => (c.key === res.data.key ? res.data : c)),
              );
              activeCharacterDraftRef.current = res.data;
              setHasUnsavedCharacter(false);
            }
          }),
        );
      }

      // 2b. Lưu Thẩm tra nghi phạm gắn liền nếu có thay đổi
      if (activeInterrogationDraftRef.current) {
        promises.push(saveCheckpoint(activeInterrogationDraftRef.current));
      }

      // 3. Lưu bố cục bảng điều tra (tọa độ ghim, xoay, scale, dây nối)
      promises.push(handleSaveBoardLayout());

      await Promise.all(promises);
      toast.success("Đã lưu toàn bộ thay đổi thành công!");
      // baseline is updated by handleSave()
      setHasUnsavedCharacter(false);
      await refreshBoardModel();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu dữ liệu");
    } finally {
      setIsUnifiedSaving(false);
    }
  };

  // Lắng nghe Ctrl+S toàn cục để bấm Lưu tức thì
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveAllUnified();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formDirty, draft, hasUnsavedCharacter, handleSaveBoardLayout]);

  const activeInterrogationDraftRef = useRef<CheckpointStudioDraft | null>(null);

  const handleCharacterInterrogationChange = (interrogationDraft: CheckpointStudioDraft) => {
    activeInterrogationDraftRef.current = interrogationDraft;

    // Cập nhật live vào rows để Flow View phản ánh ngay lập tức
    setRows((prevRows) => {
      const exists = prevRows.some(
        (r) =>
          (interrogationDraft.id && r.id === interrogationDraft.id) ||
          r.checkpoint_id === interrogationDraft.checkpointId ||
          (interrogationDraft.subjectKey && r.subject_key === interrogationDraft.subjectKey),
      );

      if (exists) {
        return prevRows.map((r) => {
          const isTarget =
            (interrogationDraft.id && r.id === interrogationDraft.id) ||
            r.checkpoint_id === interrogationDraft.checkpointId ||
            (interrogationDraft.subjectKey && r.subject_key === interrogationDraft.subjectKey);
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
        id: interrogationDraft.id || ("temp_" + interrogationDraft.checkpointId),
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
        unlocked_evidence_id: null,
        followup_of: null,
        suspect_label: null,
        evidence_step_label: null,
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
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === savedChar.id || c.key === savedChar.key);
      if (exists) {
        return prev.map((c) =>
          c.id === savedChar.id || c.key === savedChar.key ? savedChar : c,
        );
      }
      return [...prev, savedChar];
    });
    setSelectedCharacter(savedChar);
    await refreshBoardModel();
  };

  const handleDeleteCharacter = async (charId: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== charId));
    setSelectedCharacter(null);
    setInspectorTab("checkpoints");
    await refreshBoardModel();
  };

  const handlePromoteCharacterToSuspect = async (char: DbCaseCharacter) => {
    try {
      const { saveCharacter } = await import("@/lib/actions/character-actions");
      const res = await saveCharacter({
        id: char.id,
        caseId,
        key: char.key,
        name: char.name,
        role: "suspect",
        avatarCode: char.avatar_code || `avatar_${char.key}`,
        avatarUrl: char.avatar_url || null,
        avatarAssetPath: char.avatar_asset_path || null,
        phones: char.phones || [],
        aliases: char.aliases || [],
        description: char.description || "",
        slotIndex: char.slot_index ?? characters.length,
        device: char.device || null,
      });
      if (res.success) {
        toast.success(`Đã đưa "${char.name}" lên bảng điều tra làm Nghi phạm`);
        await handleSaveCharacter(res.data);
      } else {
        toast.error(res.error || "Lỗi khi đưa nhân vật lên bảng");
      }
    } catch (err: unknown) {
      toast.error("Lỗi khi đưa nhân vật lên bảng");
    }
  };

  const handleSelectFromFlow = (cp: DbCaseCheckpoint) => {
    selectRow(cp);
    const matchingPin = displayPins.find(
      (p) =>
        p.checkpointId === cp.checkpoint_id ||
        (cp.checkpoint_id.includes("phone") && p.nodeKind === "phone_lookup") ||
        (cp.checkpoint_id.includes("indictment") && p.nodeKind === "indictment") ||
        p.id.includes(cp.checkpoint_id),
    );
    if (matchingPin) {
      setSelectedNodeId(matchingPin.id);
    } else {
      setSelectedNodeId(null);
    }
  };

  const handleConnectDependencyFromFlow = async (
    sourceCpId: string,
    targetCpId: string,
  ) => {
    const targetCp = rows.find((r) => r.checkpoint_id === targetCpId);
    const sourceCp = rows.find((r) => r.checkpoint_id === sourceCpId);

    if (!targetCp || !sourceCp) return;

    const currentDeps = targetCp.depends_on || [];
    if (currentDeps.includes(sourceCp.checkpoint_id)) {
      toast.info("Quan hệ phụ thuộc này đã tồn tại.");
      return;
    }

    const currentEdges = buildDependencyEdges(rows);
    if (
      wouldCreateCycle(currentEdges, {
        source: sourceCp.checkpoint_id,
        target: targetCp.checkpoint_id,
      })
    ) {
      toast.error("Liên kết tạo chu trình vòng lặp phụ thuộc.");
      return;
    }

    const nextDeps = [...currentDeps, sourceCp.checkpoint_id];
    setRows((prev) =>
      prev.map((r) =>
        r.checkpoint_id === targetCp.checkpoint_id
          ? { ...r, depends_on: nextDeps }
          : r,
      ),
    );
    if (draft && draft.checkpointId === targetCp.checkpoint_id) {
      setDraft((d) => (d ? { ...d, dependsOn: nextDeps } : d));
    }

    const res = await updateCheckpointDependencies(caseId, [
      { checkpointId: targetCp.checkpoint_id, dependsOn: nextDeps },
    ]);

    if (res.success) {
      toast.success(
        `Đã nối phụ thuộc: "${targetCp.title || targetCp.checkpoint_id}" phụ thuộc vào "${sourceCp.title || sourceCp.checkpoint_id}"`,
      );
    } else {
      toast.error(res.error || "Lỗi khi lưu quan hệ phụ thuộc.");
    }
  };

  const handleDeleteDependencyFromFlow = async (
    sourceCpId: string,
    targetCpId: string,
  ) => {
    const targetCp = rows.find((r) => r.checkpoint_id === targetCpId);
    if (!targetCp) return;

    const nextDeps = (targetCp.depends_on || []).filter(
      (id) => id !== sourceCpId,
    );
    setRows((prev) =>
      prev.map((r) =>
        r.checkpoint_id === targetCpId ? { ...r, depends_on: nextDeps } : r,
      ),
    );
    if (draft && draft.checkpointId === targetCpId) {
      setDraft((d) => (d ? { ...d, dependsOn: nextDeps } : d));
    }

    await updateCheckpointDependencies(caseId, [
      { checkpointId: targetCpId, dependsOn: nextDeps },
    ]);
    toast.info("Đã xóa quan hệ phụ thuộc.");
  };

  const handleSelectPinOnBoard = (pinId: string | null) => {
    setSelectedNodeId(pinId);
    if (!pinId) return;

    const pin = displayPins.find((p) => p.id === pinId);
    if (!pin) return;

    // 1. Nếu pin có checkpointId
    if (pin.checkpointId) {
      const cp = rows.find(
        (r) => r.id === pin.checkpointId || r.checkpoint_id === pin.checkpointId,
      );
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    // 2. Tìm theo nodeKind đặc thù của checkpoint
    if (pin.nodeKind === "phone_lookup") {
      const cp = rows.find((r) => r.kind === "phone_lookup");
      if (cp) {
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
          (r.kind === "suspect_interrogation" || (r as any).type === "suspect_interrogation") &&
          r.subject_key === pin.subjectKey,
      );
      if (cp) {
        selectRow(cp);
      }
      return;
    }

    if (pin.nodeKind === "followup") {
      const cp = rows.find((r) => r.kind === "followup");
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    if (pin.nodeKind === "indictment") {
      const cp = rows.find((r) => r.kind === "indictment");
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    // 3. Nếu là custom node (không gắn checkpoint)
    if (pin.id.includes(":custom:") || pin.nodeKind === "custom") {
      setDraft(null);
      setSelectedId(null);
    }
  };

  const handleCreateNewCustomNode = async () => {
    if (isLoading || isBoardLoading || isCreatingCustomNode || isSaving || isBoardSaving) return;
    setIsCreatingCustomNode(true);
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const newId = `${caseId}:custom:node_${randomSuffix}`;
      const draftNode = {
        id: newId,
        caseId,
        nodeKind: "custom" as const,
        title: "Ghim mới",
        config: {
          pin_title: "Ghim mới",
          position: {
            desktop: { x: 0.5, y: 0.5 },
            mobile: { x: 0.5, y: 0.5 },
          },
        },
      };
      const ok = await handleSaveNode(draftNode);
      if (ok) {
        setSelectedId(null);
        setDraft(null);
        setSelectedNodeId(newId);
      }
    } finally {
      setIsCreatingCustomNode(false);
    }
  };

  const handleMoveToBoard = async (checkpointId: string) => {
    const cp = rows.find(
      (r) => r.id === checkpointId || r.checkpoint_id === checkpointId,
    );
    if (!cp) return;

    const nextBoardConfig: BoardConfig = {
      ...((cp.board_config as BoardConfig) || {}),
      hidden: false,
    };

    const res = await updateCheckpointBoardConfig(cp.id, nextBoardConfig);
    if (res.success) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === cp.id ? { ...r, board_config: nextBoardConfig } : r,
        ),
      );
      if (draft && draft.id === cp.id) {
        setDraft((d) => (d ? { ...d, boardConfig: nextBoardConfig } : d));
      }
      toast.success(`Đã đưa "${cp.title || cp.checkpoint_id}" lên bảng điều tra.`);
      await refreshBoardModel();
    } else {
      toast.error(res.error || "Lỗi khi đưa checkpoint lên bảng.");
    }
  };

  // Mũi tên quan hệ phụ thuộc depends_on trong Lớp logic (B23-4)
  const dependencyConnections: CaseConnection[] = useMemo(() => {
    if (!isLogicLayerActive) return [];
    const conns: CaseConnection[] = [];

    const findPinForCheckpoint = (cp: DbCaseCheckpoint) => {
      return displayPins.find(
        (p) =>
          p.checkpointId === cp.id ||
          p.checkpointId === cp.checkpoint_id ||
          (cp.kind === "phone_lookup" && p.nodeKind === "phone_lookup") ||
          (cp.kind === "suspect_interrogation" &&
            p.nodeKind === "suspect" &&
            p.subjectKey === cp.subject_key) ||
          (cp.kind === "followup" && p.nodeKind === "followup") ||
          (cp.kind === "indictment" && p.nodeKind === "indictment"),
      );
    };

    for (const cp of rows) {
      if (!cp.depends_on || !Array.isArray(cp.depends_on)) continue;
      const targetPin = findPinForCheckpoint(cp);
      if (!targetPin) continue;

      for (const depId of cp.depends_on) {
        const sourceCp = rows.find(
          (r) => r.id === depId || r.checkpoint_id === depId,
        );
        if (!sourceCp) continue;
        const sourcePin = findPinForCheckpoint(sourceCp);
        if (!sourcePin) continue;

        conns.push({
          id: `dep:${sourceCp.checkpoint_id}:to:${cp.checkpoint_id}`,
          fromPinId: sourcePin.id,
          toPinId: targetPin.id,
          isDependency: true,
        });
      }
    }
    return conns;
  }, [isLogicLayerActive, rows, displayPins]);

  const activeConnections = useMemo(() => {
    return [...connections, ...dependencyConnections];
  }, [connections, dependencyConnections]);

  const handleConnectPinsWithLogic = async (
    fromPinId: string,
    toPinId: string,
  ) => {
    if (!isLogicLayerActive) {
      handleConnectPins(fromPinId, toPinId);
      return;
    }

    // Ở chế độ logic layer: nối fromPin -> toPin biểu diễn quan hệ toPin phụ thuộc vào fromPin
    const findCpByPinId = (pinId: string) => {
      const pin = displayPins.find((p) => p.id === pinId);
      if (!pin) return null;
      if (pin.checkpointId) {
        const cp = rows.find(
          (r) =>
            r.id === pin.checkpointId || r.checkpoint_id === pin.checkpointId,
        );
        if (cp) return cp;
      }
      if (pin.nodeKind === "phone_lookup") {
        return rows.find((r) => r.kind === "phone_lookup") || null;
      }
      if (pin.nodeKind === "suspect" && pin.subjectKey) {
        return (
          rows.find(
            (r) =>
              r.kind === "suspect_interrogation" &&
              r.subject_key === pin.subjectKey,
          ) || null
        );
      }
      if (pin.nodeKind === "followup") {
        return rows.find((r) => r.kind === "followup") || null;
      }
      if (pin.nodeKind === "indictment") {
        return rows.find((r) => r.kind === "indictment") || null;
      }
      return null;
    };

    const sourceCp = findCpByPinId(fromPinId);
    const targetCp = findCpByPinId(toPinId);

    if (!sourceCp || !targetCp) {
      toast.info("Chỉ có thể tạo quan hệ phụ thuộc giữa các node Checkpoint.");
      return;
    }

    if (sourceCp.checkpoint_id === targetCp.checkpoint_id) {
      toast.error("Checkpoint không thể phụ thuộc chính nó.");
      return;
    }

    const currentDeps = targetCp.depends_on || [];
    if (currentDeps.includes(sourceCp.checkpoint_id)) {
      toast.info("Quan hệ phụ thuộc này đã tồn tại.");
      return;
    }

    const currentEdges = buildDependencyEdges(rows);
    if (
      wouldCreateCycle(currentEdges, {
        source: sourceCp.checkpoint_id,
        target: targetCp.checkpoint_id,
      })
    ) {
      toast.error("Liên kết tạo chu trình vòng lặp phụ thuộc.");
      return;
    }

    const nextDeps = [...currentDeps, sourceCp.checkpoint_id];
    setRows((prev) =>
      prev.map((r) =>
        r.checkpoint_id === targetCp.checkpoint_id
          ? { ...r, depends_on: nextDeps }
          : r,
      ),
    );
    if (draft && draft.checkpointId === targetCp.checkpoint_id) {
      setDraft((d) => (d ? { ...d, dependsOn: nextDeps } : d));
    }

    const res = await updateCheckpointDependencies(caseId, [
      { checkpointId: targetCp.checkpoint_id, dependsOn: nextDeps },
    ]);

    if (res.success) {
      toast.success(
        `Đã nối phụ thuộc: "${targetCp.title || targetCp.checkpoint_id}" phụ thuộc vào "${sourceCp.title || sourceCp.checkpoint_id}"`,
      );
    } else {
      toast.error(res.error || "Lỗi khi lưu quan hệ phụ thuộc.");
    }
  };

  const handleDeleteConnectionWithLogic = async (connId: string) => {
    if (connId.startsWith("dep:")) {
      const parts = connId.split(":");
      const sourceCpId = parts[1];
      const targetCpId = parts[3];

      if (!sourceCpId || !targetCpId) return;

      const targetCp = rows.find((r) => r.checkpoint_id === targetCpId);
      if (!targetCp) return;

      const nextDeps = (targetCp.depends_on || []).filter(
        (id) => id !== sourceCpId,
      );
      setRows((prev) =>
        prev.map((r) =>
          r.checkpoint_id === targetCpId ? { ...r, depends_on: nextDeps } : r,
        ),
      );
      if (draft && draft.checkpointId === targetCpId) {
        setDraft((d) => (d ? { ...d, dependsOn: nextDeps } : d));
      }

      await updateCheckpointDependencies(caseId, [
        { checkpointId: targetCpId, dependsOn: nextDeps },
      ]);
      toast.info("Đã xóa quan hệ phụ thuộc.");
      return;
    }

    handleDeleteConnection(connId);
  };

  const handleAutoLayoutLogic = () => {
    const ids = rows.map((r) => r.checkpoint_id);
    const inDegree = new Map<string, number>(ids.map((id) => [id, 0]));
    const adj = new Map<string, string[]>(ids.map((id) => [id, []]));

    for (const r of rows) {
      for (const dep of r.depends_on || []) {
        if (adj.has(dep)) {
          adj.get(dep)!.push(r.checkpoint_id);
          inDegree.set(r.checkpoint_id, (inDegree.get(r.checkpoint_id) || 0) + 1);
        }
      }
    }

    const levels = new Map<string, number>(ids.map((id) => [id, 0]));
    const queue = ids.filter((id) => (inDegree.get(id) || 0) === 0);

    while (queue.length > 0) {
      const u = queue.shift()!;
      const curL = levels.get(u) || 0;
      for (const v of adj.get(u) || []) {
        levels.set(v, Math.max(levels.get(v) || 0, curL + 1));
        inDegree.set(v, (inDegree.get(v) || 0) - 1);
        if ((inDegree.get(v) || 0) === 0) queue.push(v);
      }
    }

    const maxLevel = Math.max(0, ...Array.from(levels.values()));
    const levelNodes = new Map<number, string[]>();
    for (const [id, lvl] of levels.entries()) {
      const list = levelNodes.get(lvl) || [];
      list.push(id);
      levelNodes.set(lvl, list);
    }

    levelNodes.forEach((nodeList, lvl) => {
      const x = maxLevel === 0 ? 0.5 : 0.15 + (lvl / Math.max(1, maxLevel)) * 0.7;
      nodeList.forEach((cpId, idx) => {
        const y = 0.2 + ((idx + 1) / (nodeList.length + 1)) * 0.6;
        const pin = displayPins.find(
          (p) =>
            p.checkpointId === cpId ||
            (cpId.includes("phone") && p.nodeKind === "phone_lookup") ||
            (cpId.includes("indictment") && p.nodeKind === "indictment") ||
            p.id.includes(cpId),
        );
        if (pin) {
          handlePositionChange(pin.id, Number(x.toFixed(3)), Number(y.toFixed(3)));
        }
      });
    });

    toast.info(
      "Đã sắp xếp tự động lớp logic (chỉ hiển thị tạm thời, bấm 'Lưu Bố Cục' nếu muốn áp dụng).",
    );
  };

  const isEditingCustomNode = Boolean(
    selectedNode &&
      !("checkpoint_id" in selectedNode && selectedNode.checkpoint_id) &&
      (selectedNode.id.includes(":custom:") ||
        ("node_kind" in selectedNode && selectedNode.node_kind === "custom") ||
        ("nodeKind" in selectedNode && selectedNode.nodeKind === "custom")),
  );

  const isBusy = isLoading || isBoardLoading || isSaving || isBoardSaving || isCreatingCustomNode;

  return (
    <div
      data-studio-ready={isBusy ? "false" : "true"}
      className="flex h-full min-h-0 w-full flex-col bg-[#0c0d12]"
    >
      {/* 1. Header Toolbar của Checkpoint Studio & Board Studio gộp */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#090a0f] px-3 z-30">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-100 tracking-wide uppercase">
            Checkpoint Studio
          </span>
          {hasUnsaved && (
            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Chưa lưu
            </span>
          )}
        </div>

        {/* Thanh công cụ phải */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Nút Thêm Checkpoint */}
          <Button
            type="button"
            size="sm"
            onClick={createRow}
            className="gap-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 h-7 px-2.5 font-semibold cursor-pointer"
            title="Tạo checkpoint mới"
          >
            <Plus className="size-3.5" />
            <span>Thêm Checkpoint</span>
          </Button>

          {/* Nút Thêm Nhân vật */}
          <Button
            type="button"
            size="sm"
            onClick={handleCreateNewCharacter}
            className="gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 h-7 px-2.5 font-semibold cursor-pointer"
            title="Tạo nhân vật mới"
          >
            <Plus className="size-3.5" />
            <span>Thêm Nhân vật</span>
          </Button>

          {/* Nút Chơi thử */}
          <Button
            type="button"
            size="sm"
            onClick={() => handlePlaytest(draft?.checkpointId)}
            className="gap-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 h-7 px-2.5 font-semibold cursor-pointer"
            title="Chơi thử vụ án"
          >
            <Play className="size-3.5" />
            <span>Chơi thử</span>
          </Button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Nút LƯU DUY NHẤT (Checkpoint, Nhân vật, Bố cục Bảng) */}
          <Button
            type="button"
            size="sm"
            onClick={handleSaveAllUnified}
            disabled={isBusy || isUnifiedSaving}
            className="gap-1.5 text-xs bg-amber-500 text-black font-bold hover:bg-amber-400 disabled:opacity-50 h-7 px-3.5 shadow-md cursor-pointer"
            title="Lưu tất cả thay đổi (Ctrl+S)"
          >
            <Save className="size-3.5" />
            <span>{isUnifiedSaving ? "Đang lưu..." : "LƯU"}</span>
          </Button>

          {/* Nút Linter Vụ Án */}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsLintModalOpen(true)}
            className={cn(
              "gap-1 text-xs h-7 px-2",
              lintResult.errorCount > 0
                ? "text-rose-400 bg-rose-950/20"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Kiểm tra logic vụ án (Case Linter)"
          >
            <Sparkles className="size-3.5" />
            <span>Linter</span>
            {lintResult.errorCount > 0 && (
              <span className="rounded bg-rose-500/30 px-1 text-[10px] text-rose-300 font-mono">
                {lintResult.errorCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* 2. Main Workspace: Dual-View (Flow + Board) + Inspector */}
      <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row overflow-hidden relative">
        <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden relative">
          <div className="flex flex-1 min-h-0 w-full flex-row overflow-hidden relative">
        {/* CỘT 1: Sơ đồ luồng Flow hình hộp (Bên trái) */}
        <div
          style={{ width: `${flowWidth}px` }}
          className={cn(
            "hidden md:flex flex-col min-h-0 shrink-0 border-r border-white/10 bg-[#0d0d12] relative overflow-hidden",
            !isResizingFlow && "transition-[width] duration-75 ease-out",
          )}
        >
          <CheckpointFlowView
            rows={rows}
            selectedId={selectedId}
            onSelectCheckpoint={handleSelectFromFlow}
            onCreateCheckpoint={createRow}
            onConnectDependencies={handleConnectDependencyFromFlow}
            onDeleteDependency={handleDeleteDependencyFromFlow}
          />
        </div>

        {/* Thanh kéo phân cách Flow và Board */}
        <div
          onMouseDown={startResizingFlow}
          className={cn(
            "hidden md:block relative z-30 w-1.5 -mr-1 cursor-col-resize select-none shrink-0 bg-white/5 transition-colors hover:bg-purple-500 active:bg-purple-600",
            isResizingFlow && "bg-purple-500",
          )}
          title="Kéo sang trái/phải để điều chỉnh tỷ lệ giữa Sơ đồ luồng Flow và Bảng điều tra Board"
        />

        {/* CỘT 2: Bảng điều tra Board (Ở giữa) */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col relative h-full">
          {/* Thanh công cụ Quick Transform nổi trên Canvas */}
          {selectedNode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#16120e]/95 backdrop-blur-md rounded-lg border border-amber-500/50 shadow-2xl font-mono text-xs select-none">
              <span className="text-amber-200/90 font-bold max-w-[140px] truncate pr-1">
                {("title" in selectedNode
                  ? selectedNode.title
                  : "label" in selectedNode
                    ? selectedNode.label
                    : "") || "Ghim"}
              </span>

              <div className="h-4 w-px bg-white/15 mx-0.5" />

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, -2, 0)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Xoay nghiêng trái (-2°)"
              >
                <RotateCcw className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 2, 0)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Xoay nghiêng phải (+2°)"
              >
                <RotateCw className="size-3.5" />
              </button>

              <div className="h-4 w-px bg-white/15 mx-0.5" />

              <button
                type="button"
                onClick={() =>
                  handleAdjustNodeTransform(selectedNode.id, 0, -0.1)
                }
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Thu nhỏ (-0.1x)"
              >
                <Minus className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 0, 0.1)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Phóng to (+0.1x)"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          )}

          {/* Canvas chính */}
          <div className="flex-1 h-full min-h-0 relative">
            <HeroInteractive
              className="w-full h-full"
              controlledCaseId={caseId}
              customPins={displayPins}
              customConnections={activeConnections}
              isEditMode={true}
              selectedPinId={selectedNodeId}
              onSelectPin={handleSelectPinOnBoard}
              onPinClick={handleSelectPinOnBoard}
              onPinPositionChange={handlePositionChange}
              onConnectPins={handleConnectPinsWithLogic}
              onDeleteConnection={handleDeleteConnectionWithLogic}
            />
          </div>

        </div>

          </div>

          {/* Khay "Ngoài bảng" (Off-board Tray) ở đáy canvas */}
          <OffBoardTray
            checkpoints={rows}
            dossiers={dossiers}
            characters={characters}
            selectedCheckpointId={selectedId}
            selectedCharacterId={selectedCharacter?.id}
            onSelectCheckpoint={(cp) => {
              selectRow(cp);
              setSelectedCharacter(null);
              setInspectorTab("checkpoints");
              setSelectedNodeId(null);
            }}
            onSelectCharacter={(char) => {
              setSelectedCharacter(char);
              setInspectorTab("characters");
              setSelectedNodeId(null);
            }}
            onPromoteCharacterToSuspect={handlePromoteCharacterToSuspect}
            onSelectDossier={() => {
              router.push(`/studio/dossier?case=${encodeURIComponent(caseId)}`);
            }}
            onMoveToBoard={handleMoveToBoard}
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
        <div
          style={{ width: `${sidebarWidth}px` }}
          className={cn(
            "flex h-[55%] min-h-0 shrink-0 flex-col md:h-full max-w-[85vw]",
            !isResizing && "transition-[width] duration-75 ease-out",
          )}
        >
          {isEditingCustomNode && selectedNode ? (
            <BoardNodeForm
              caseId={caseId}
              node={selectedNode}
              onSave={handleSaveNode}
              onDelete={handleDeleteNode}
              onClose={() => setSelectedNodeId(null)}
            />
          ) : (
            <div className="flex h-full w-full min-h-0 flex-col bg-[#0c0c10] border-t border-white/10 md:border-l md:border-t-0">
              {/* Segmented Switcher Tab giữa Checkpoint và Nhân vật */}
              <div className="h-10 shrink-0 px-3 bg-[#111118] border-b border-white/10 flex items-center justify-between text-xs font-mono select-none">
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectorTab("checkpoints");
                      setSelectedCharacter(null);
                    }}
                    className={cn(
                      "px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors",
                      inspectorTab === "checkpoints" && !selectedCharacter
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-zinc-400 hover:text-zinc-200",
                    )}
                  >
                    Mục tiêu ({generalCheckpoints.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectorTab("characters");
                      if (!selectedCharacter && characters.length > 0) {
                        setSelectedCharacter(characters[0]);
                      }
                    }}
                    className={cn(
                      "px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors",
                      inspectorTab === "characters" || selectedCharacter
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "text-zinc-400 hover:text-zinc-200",
                    )}
                  >
                    Nhân vật ({characters.length})
                  </button>
                </div>

                {/* Dropdown danh sách nhân vật để xem và chuyển đổi nhanh */}
                {characters.length > 0 && (
                  <select
                    value={selectedCharacter?.id || selectedCharacter?.key || ""}
                    onChange={(e) => {
                      const found = characters.find(
                        (c) => c.id === e.target.value || c.key === e.target.value,
                      );
                      if (found) {
                        setSelectedCharacter(found);
                        setInspectorTab("characters");
                        setSelectedNodeId(null);
                      }
                    }}
                    className="max-w-[170px] h-7 px-2 rounded bg-black/50 border border-white/10 text-xs text-purple-200 outline-none focus:border-purple-400 cursor-pointer font-sans truncate"
                    title="Chọn nhân vật để xem hồ sơ"
                  >
                    <option value="" disabled>
                      -- Danh sách ({characters.length}) --
                    </option>
                    {characters.map((c) => {
                      const roleText =
                        c.role === "victim"
                          ? "Nạn nhân"
                          : c.role === "suspect"
                            ? "Nghi phạm"
                            : c.role === "witness"
                              ? "Nhân chứng"
                              : "Liên quan";
                      return (
                        <option key={c.id || c.key} value={c.id || c.key}>
                          {c.name || "Không tên"} ({roleText})
                        </option>
                      );
                    })}
                  </select>
                )}


              </div>

              {/* Nội dung Inspector */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {inspectorTab === "characters" || selectedCharacter ? (
                  <CharacterEditor
                    caseId={caseId}
                    character={selectedCharacter}
                    allCharacters={characters}
                    checkpoints={rows}
                    onSave={handleSaveCharacter}
                    onDelete={handleDeleteCharacter}
                    onDraftChange={handleCharacterLiveDraftChange}
                    onInterrogationChange={handleCharacterInterrogationChange}
                    onOpenInterrogation={(cp) => {
                      selectRow(cp);
                      setSelectedCharacter(null);
                      setInspectorTab("checkpoints");
                    }}
                    onClose={() => {
                      setSelectedCharacter(null);
                      setInspectorTab("checkpoints");
                    }}
                  />
                ) : draft ? (
                  <CheckpointEditor
                    draft={draft}
                    dossiers={dossiers}
                    characters={characters}
                    checkpoints={rows}
                    onChange={updateDraft}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onPlaytest={() => handlePlaytest(draft.checkpointId)}
                    isSaving={isSaving}
                    isDirty={formDirty}
                  />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-zinc-500">
                    <p className="text-xs font-medium text-zinc-300">Chưa chọn mục nào</p>
                    <p className="mt-1 text-[11px] text-zinc-500 max-w-[240px]">
                      Bấm vào checkpoint trên sơ đồ hoặc ghim trên bảng để chỉnh sửa.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
