"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import {
  getCanonicalSuspectKey,
  findValidCaseCharacter,
} from "@/lib/cases/characters";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearInvestigationStorage,
  getStorageJson,
  setStorageJson,
} from "@/lib/storage";
import { caseStorageKey, clearCaseProgress } from "@/lib/cases/case-id";
import { getActiveVictim, isVictimReference } from "@/lib/cases/case-characters";
import { detectiveAudio } from "@/lib/investigation-audio";
import { emitInvestigationEvent, useInvestigationEvent } from "@/lib/investigation-events";

export interface SuspectItem {
  id: string;
  name: string;
  clueIds: string[];
  motiveClueIds?: string[];
  motiveReason?: string;
  alibiClueIds?: string[];
  alibiReason?: string;
  contradictionClueIds?: string[];
  contradictionReason?: string;
}

export type CulpritKey = string;

export function sanitizeSuspectsList(items: SuspectItem[]): SuspectItem[] {
  const map = new Map<string, SuspectItem>();
  for (const s of items) {
    if (!s || !s.name) continue;
    const { canonicalId, canonicalName } = getCanonicalSuspectKey(s);
    if (isVictimReference(canonicalId) || isVictimReference(s.name)) continue;
    map.set(canonicalId, {
      ...s,
      id: canonicalId,
      name: canonicalName || s.name,
    });
  }
  return Array.from(map.values());
}

/** Gom state tiến trình vụ án: suspects, phone, followup, indictment, reinvestigate. */
export function useInvestigationState(opts?: {
  caseId?: string;
  onOpenReinvestigation?: () => void;
  onOpenEpilogue?: () => void;
}) {
  const caseId = opts?.caseId || "case_000";
  const { roomCode, roomState, syncUpdate } = useRoomSync();

  const sKey = useCallback(
    (key: string) => caseStorageKey(caseId, key),
    [caseId],
  );

  const [suspects, setSuspects] = useState<SuspectItem[]>([]);
  const [isReinvestigateModalOpen, setIsReinvestigateModalOpen] =
    useState(false);
  const [hasOpenedReinvestigation, setHasOpenedReinvestigation] =
    useState(false);
  const [phoneLookupSuccess, setPhoneLookupSuccess] = useState(false);

  const [isProgressLoaded, setIsProgressLoaded] = useState(false);
  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false);
  const [solvedCulprit, setSolvedCulprit] = useState<CulpritKey | null>(null);
  const [isEpilogueOpen, setIsEpilogueOpen] = useState(false);
  const [isFinalEpilogueOpen, setIsFinalEpilogueOpen] = useState(false);
  const [isFollowupQuestionOpen, setIsFollowupQuestionOpen] = useState(false);
  const [isGameplayGuideOpen, setIsGameplayGuideOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isPhoneNarrativeOpen, setIsPhoneNarrativeOpen] = useState(false);
  const [isDossierEOpen, setIsDossierEOpen] = useState(false);
  const [isInternalPhoneOpen, setIsInternalPhoneOpen] = useState(false);

  const [investigatedSuspects, setInvestigatedSuspects] = useState<
    CulpritKey[]
  >([]);
  const [solvedFollowupQuestions, setSolvedFollowupQuestions] = useState<
    CulpritKey[]
  >([]);
  const [activeFollowupCulprit, setActiveFollowupCulprit] =
    useState<CulpritKey | null>(null);
  const [narrativeCulprit, setNarrativeCulprit] = useState<CulpritKey | null>(
    null,
  );
  const [narrativeChoice, setNarrativeChoice] = useState<string | null>(null);

  const [isAddSuspectOpen, setIsAddSuspectOpen] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState<SuspectItem | null>(
    null,
  );
  const [isPhoneLookupOpen, setIsPhoneLookupOpen] = useState(false);
  const [isIndictmentOpen, setIsIndictmentOpen] = useState(false);

  const { checkpoints, loading: isCheckpointsLoading } = useCaseCheckpoints(caseId);

  const reloadProgress = useCallback(() => {
    const rawSuspects = getStorageJson<any[]>(sKey("canvas_suspects"), []);
    const validList = rawSuspects.filter((s) => s && s.id && s.name);
    if (validList.length > 0) {
      setSuspects(sanitizeSuspectsList(validList));
    }

    const solvedFollowups = getStorageJson<CulpritKey[]>(
      sKey("solved_followups"),
      [],
    );
    setSolvedFollowupQuestions(solvedFollowups);
    if (getStorageItem(sKey("reinvestigate_opened")) === "true") {
      setHasOpenedReinvestigation(true);
    }

    const isPhoneSolved = getStorageItem(sKey("phone_solved")) === "true";
    if (isPhoneSolved) {
      setPhoneLookupSuccess(true);
    }

    setInvestigatedSuspects(
      getStorageJson<CulpritKey[]>(sKey("investigated_suspects"), []),
    );

    if (getStorageItem(sKey("indictment_solved")) === "true") {
      const savedCulprit = getStorageItem(
        sKey("indictment_culprit"),
      ) as CulpritKey | null;
      if (savedCulprit) {
        setIsIndictmentSolved(true);
        setSolvedCulprit(savedCulprit);
      }
    }
  }, [sKey]);

  useEffect(() => {
    reloadProgress();
    setIsProgressLoaded(true);
  }, [reloadProgress]);

  useInvestigationEvent("REFRESH_CANVAS_STATE", () => {
    reloadProgress();
  });

  // Sync state when in a group room
  useEffect(() => {
    if (!roomCode) return;

    if (roomState.phoneSolved) {
      setPhoneLookupSuccess(true);
    }
    if (roomState.solvedFollowups && roomState.solvedFollowups.length > 0) {
      setSolvedFollowupQuestions((prev) => {
        const merged = Array.from(new Set([...prev, ...roomState.solvedFollowups])) as CulpritKey[];
        return merged;
      });
    }
    if (roomState.investigatedSuspects && roomState.investigatedSuspects.length > 0) {
      setInvestigatedSuspects((prev) => {
        const merged = Array.from(new Set([...prev, ...roomState.investigatedSuspects])) as CulpritKey[];
        return merged;
      });
    }
    if (roomState.indictmentSolved && roomState.solvedCulprit) {
      setIsIndictmentSolved(true);
      setSolvedCulprit(roomState.solvedCulprit as CulpritKey);
    }
  }, [roomCode, roomState]);

  const saveSuspectsState = (newSuspects: SuspectItem[]) => {
    const sanitized = sanitizeSuspectsList(newSuspects);
    setSuspects(sanitized);
    setStorageJson(sKey("canvas_suspects"), sanitized);
  };

  const handleSaveSuspect = (savedSuspect: SuspectItem) => {
    if (!savedSuspect.name || isVictimReference(savedSuspect.name)) return;

    const { canonicalId, canonicalName } = getCanonicalSuspectKey(savedSuspect);
    if (isVictimReference(canonicalId)) return;

    const normalizedItem: SuspectItem = {
      ...savedSuspect,
      id: canonicalId,
      name: canonicalName || savedSuspect.name,
    };

    setSuspects((prev) => {
      const existingIndex = prev.findIndex((s) => {
        const suspectKey = getCanonicalSuspectKey(s);
        return suspectKey.canonicalId === canonicalId || s.id === canonicalId;
      });
      let updated: SuspectItem[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = normalizedItem;
      } else {
        updated = [...prev, normalizedItem];
      }
      const sanitized = sanitizeSuspectsList(updated);
      setStorageItem(sKey("canvas_suspects"), JSON.stringify(sanitized));
      return sanitized;
    });
  };

  const handleDeleteSuspect = (id: string) => {
    const { canonicalId } = getCanonicalSuspectKey({ id, name: id });
    const suspectToDelete = suspects.find(
      (s) =>
        s.id === id || getCanonicalSuspectKey(s).canonicalId === canonicalId,
    );
    const updated = suspects.filter(
      (s) =>
        s.id !== id && getCanonicalSuspectKey(s).canonicalId !== canonicalId,
    );
    saveSuspectsState(updated);

    if (suspectToDelete) {
      const { canonicalId: cId } = getCanonicalSuspectKey(suspectToDelete);
      const culpritType: CulpritKey = cId;
      const remainingHasCulprit = updated.some(
        (s) => getCanonicalSuspectKey(s).canonicalId === culpritType,
      );
      if (!remainingHasCulprit) {
        setInvestigatedSuspects((prev) => {
          const next = prev.filter((c) => c !== culpritType);
          setStorageItem(sKey("investigated_suspects"), JSON.stringify(next));
          return next;
        });
        if (solvedCulprit === culpritType) {
          setSolvedCulprit(null);
          setIsIndictmentSolved(false);
          removeStorageItem(sKey("indictment_solved"));
          removeStorageItem(sKey("indictment_culprit"));
        }
      }
    }
  };

  const handlePhoneLookupSuccess = (_phone: string, _info: string) => {
    setPhoneLookupSuccess(true);
    if (roomCode) {
      syncUpdate({ phoneSolved: true }, `đã bẻ khóa thành công điện thoại của ${getActiveVictim()?.name || "nạn nhân"}`);
    } else {
      setStorageItem(sKey("phone_solved"), "true");
    }
    setIsPhoneLookupOpen(false);
    setIsPhoneNarrativeOpen(true);
  };

  const handleFollowupSuccess = (culprit: CulpritKey, choice?: string) => {
    const updated = Array.from(new Set([...solvedFollowupQuestions, culprit]));
    setSolvedFollowupQuestions(updated);

    if (roomCode) {
      syncUpdate(
        { solvedFollowups: updated },
        `đã hoàn thành thẩm tra nghi phạm`
      );
    } else {
      setStorageItem(sKey("solved_followups"), JSON.stringify(updated));
      if (choice) {
        setStorageItem(sKey(`followup_${culprit}_choice`), choice);
      }
    }

    setIsFollowupQuestionOpen(false);
    setNarrativeCulprit(culprit);
    setNarrativeChoice(choice || null);
    setIsEpilogueOpen(true);
  };

  const handleSubmitIndictment = (data: {
    culprit: CulpritKey;
    suspectName: string;
    motive: string;
    selectedClueIds: string[];
    reasoning: string;
  }) => {
    setIsIndictmentSolved(true);
    setSolvedCulprit(data.culprit);
    setIsIndictmentOpen(false);

    if (roomCode) {
      syncUpdate(
        { indictmentSolved: true, solvedCulprit: data.culprit },
        "đã nộp bản kết luận điều tra và vạch trần hung thủ!"
      );
    } else {
      setStorageItem(sKey("indictment_solved"), "true");
      setStorageItem(sKey("indictment_culprit"), data.culprit);
    }

    setIsFinalEpilogueOpen(true);
    if (opts?.onOpenEpilogue) {
      opts.onOpenEpilogue();
    } else {
      emitInvestigationEvent("OPEN_EPILOGUE");
    }
  };

  const handleResetAll = () => {
    detectiveAudio.playGlassSound();
    setSuspects([]);
    setPhoneLookupSuccess(false);
    setInvestigatedSuspects([]);
    setSolvedFollowupQuestions([]);
    setActiveFollowupCulprit(null);
    setNarrativeChoice(null);
    setIsIndictmentSolved(false);
    setSolvedCulprit(null);
    setIsReinvestigateModalOpen(false);
    setHasOpenedReinvestigation(false);
    setIsEpilogueOpen(false);
    setIsFinalEpilogueOpen(false);
    setIsFollowupQuestionOpen(false);
    setIsPhoneNarrativeOpen(false);
    clearCaseProgress(caseId);
  };

  const handleOpenReinvestigation = useCallback(() => {
    setIsReinvestigateModalOpen(true);
    setHasOpenedReinvestigation(true);
    setStorageItem(sKey("reinvestigate_opened"), "true");
    if (opts?.onOpenReinvestigation) {
      opts.onOpenReinvestigation();
    }
  }, [opts?.onOpenReinvestigation, sKey]);

  // Khám xét hiện trường mở sẵn từ đầu game (USP).
  const effectiveReinvestigateUnlocked = true;
  const effectivePhoneSolved = phoneLookupSuccess;
  const effectiveIndictmentSolved = isIndictmentSolved;

  return {
    caseId,
    checkpoints,
    suspects,
    setSuspects,
    saveSuspectsState,
    handleSaveSuspect,
    handleDeleteSuspect,
    isReinvestigateModalOpen,
    setIsReinvestigateModalOpen,
    hasOpenedReinvestigation,
    setHasOpenedReinvestigation,
    phoneLookupSuccess,
    setPhoneLookupSuccess,
    isProgressLoaded,
    isCheckpointsLoading,
    isIndictmentSolved,
    setIsIndictmentSolved,
    solvedCulprit,
    setSolvedCulprit,
    isEpilogueOpen,
    setIsEpilogueOpen,
    isFinalEpilogueOpen,
    setIsFinalEpilogueOpen,
    isFollowupQuestionOpen,
    setIsFollowupQuestionOpen,
    isGameplayGuideOpen,
    setIsGameplayGuideOpen,
    isWalkthroughOpen,
    setIsWalkthroughOpen,
    isPhoneNarrativeOpen,
    setIsPhoneNarrativeOpen,
    isDossierEOpen,
    setIsDossierEOpen,
    isInternalPhoneOpen,
    setIsInternalPhoneOpen,
    investigatedSuspects,
    setInvestigatedSuspects,
    solvedFollowupQuestions,
    setSolvedFollowupQuestions,
    activeFollowupCulprit,
    setActiveFollowupCulprit,
    narrativeCulprit,
    setNarrativeCulprit,
    narrativeChoice,
    setNarrativeChoice,
    isAddSuspectOpen,
    setIsAddSuspectOpen,
    editingSuspect,
    setEditingSuspect,
    isPhoneLookupOpen,
    setIsPhoneLookupOpen,
    isIndictmentOpen,
    setIsIndictmentOpen,
    handlePhoneLookupSuccess,
    handleFollowupSuccess,
    handleSubmitIndictment,
    handleResetAll,
    handleOpenReinvestigation,
    effectiveReinvestigateUnlocked,
    effectivePhoneSolved,
    effectiveIndictmentSolved,
  };
}
