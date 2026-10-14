"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import {
  getCanonicalSuspectKey,
  findValidCaseCharacter,
} from "@/lib/cases/case-000-suspects";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearInvestigationStorage,
  getStorageJson,
  setStorageJson,
} from "@/lib/storage";
import { detectiveAudio } from "@/lib/investigation-audio";
import { emitInvestigationEvent } from "@/lib/investigation-events";

export interface SuspectItem {
  id: string;
  name: string;
  clueIds: string[];
  motiveClueIds?: string[];
  alibiClueIds?: string[];
}

export type CulpritKey = "vu" | "tung" | "ha" | (string & {});

export const ALL_CASE_000_SUSPECTS: SuspectItem[] = [
  { id: "suspect-vu", name: "Lê Quang Vũ", clueIds: [] },
  { id: "suspect-tung", name: "Nguyễn Thanh Tùng", clueIds: [] },
  { id: "suspect-ha", name: "Trần Thị Hà", clueIds: [] },
];

export function sanitizeSuspectsList(items: SuspectItem[]): SuspectItem[] {
  const map = new Map<string, SuspectItem>();
  for (const s of items) {
    if (!s || !s.name) continue;
    const { canonicalId, canonicalName } = getCanonicalSuspectKey(s);
    if (canonicalId === "khang" || (s.name && s.name.toLowerCase().includes("khang"))) continue;
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
  const caseId = opts?.caseId || "case-000";
  const sKey = useCallback(
    (key: string) => (caseId === "case-000" ? key : `${caseId}::${key}`),
    [caseId],
  );

  const [suspects, setSuspects] = useState<SuspectItem[]>([]);
  const [isReinvestigateUnlocked, setIsReinvestigateUnlocked] = useState(false);
  const [isReinvestigateModalOpen, setIsReinvestigateModalOpen] =
    useState(false);
  const [hasOpenedReinvestigation, setHasOpenedReinvestigation] =
    useState(false);
  const [phoneLookupSuccess, setPhoneLookupSuccess] = useState(false);
  const [isShowAllPinsPreview, setIsShowAllPinsPreview] = useState(false);

  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false);
  const [solvedCulprit, setSolvedCulprit] = useState<CulpritKey | null>(null);
  const [isEpilogueOpen, setIsEpilogueOpen] = useState(false);
  const [isFinalEpilogueOpen, setIsFinalEpilogueOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [activeDossierType, setActiveDossierType] = useState<
    "A" | "B" | "C" | null
  >(null);
  const [isFollowupQuestionOpen, setIsFollowupQuestionOpen] = useState(false);
  const [isEvidenceGuideOpen, setIsEvidenceGuideOpen] = useState(false);
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

  const { checkpoints } = useCaseCheckpoints(caseId);

  const convergenceCp = useMemo(() => {
    return checkpoints.find((cp) => cp.id.includes("convergence"));
  }, [checkpoints]);

  const requiredForReinvestigate = useMemo(() => {
    const reqs = convergenceCp?.pickerConfig?.requiredEvidenceIds;
    if (reqs && reqs.length > 0) {
      return reqs.map((r) => r.toLowerCase().trim());
    }
    return ["vu", "tung"];
  }, [convergenceCp]);

  const isReinvestigateConditionMet = useCallback(
    (solved: string[]) => {
      return requiredForReinvestigate.every((req) => solved.includes(req));
    },
    [requiredForReinvestigate]
  );

  useEffect(() => {
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
    if (
      isReinvestigateConditionMet(solvedFollowups) ||
      getStorageItem(sKey("reinvestigate_unlocked")) === "true"
    ) {
      setIsReinvestigateUnlocked(true);
    }
    if (getStorageItem(sKey("reinvestigate_opened")) === "true") {
      setHasOpenedReinvestigation(true);
    }

    const phoneInputs = getStorageJson<Record<string, string>>(
      sKey("phone_inputs"),
      {},
    );
    const isPhoneSolved = getStorageItem(sKey("phone_solved")) === "true";
    if (
      phoneInputs.phone1 ||
      phoneInputs.phone2 ||
      phoneInputs.phone3 ||
      isPhoneSolved
    ) {
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
  }, [sKey, isReinvestigateConditionMet]);

  const saveSuspectsState = (newSuspects: SuspectItem[]) => {
    const sanitized = sanitizeSuspectsList(newSuspects);
    setSuspects(sanitized);
    setStorageJson(sKey("canvas_suspects"), sanitized);
  };

  const handleSaveSuspect = (savedSuspect: SuspectItem) => {
    if (!savedSuspect.name || savedSuspect.name.toLowerCase().includes("khang")) return;

    const { canonicalId, canonicalName } = getCanonicalSuspectKey(savedSuspect);
    if (canonicalId === "khang") return;

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
    setStorageItem(sKey("phone_solved"), "true");
    setIsPhoneLookupOpen(false);
    setIsPhoneNarrativeOpen(true);
  };

  const handleFollowupSuccess = (culprit: CulpritKey, choice?: string) => {
    const updated = Array.from(new Set([...solvedFollowupQuestions, culprit]));
    setSolvedFollowupQuestions(updated);
    setStorageItem(sKey("solved_followups"), JSON.stringify(updated));
    if (choice) {
      setStorageItem(sKey(`followup_${culprit}_choice`), choice);
    }
    if (isReinvestigateConditionMet(updated)) {
      setIsReinvestigateUnlocked(true);
      setStorageItem(sKey("reinvestigate_unlocked"), "true");
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
    setStorageItem(sKey("indictment_solved"), "true");
    setStorageItem(sKey("indictment_culprit"), data.culprit);
    setIsFinalEpilogueOpen(true);
    if (opts?.onOpenEpilogue) {
      opts.onOpenEpilogue();
    } else {
      emitInvestigationEvent("OPEN_EPILOGUE");
    }
  };

  const handleOpenDossier = (dossierType: "A" | "B" | "C") => {
    setActiveDossierType(dossierType);
    setIsDossierOpen(true);
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
    setIsReinvestigateUnlocked(false);
    setIsReinvestigateModalOpen(false);
    setHasOpenedReinvestigation(false);
    setIsEpilogueOpen(false);
    setIsFinalEpilogueOpen(false);
    setIsDossierOpen(false);
    setIsFollowupQuestionOpen(false);
    setIsPhoneNarrativeOpen(false);
    if (caseId === "case-000") {
      clearInvestigationStorage();
    } else {
      [
        sKey("canvas_suspects"),
        sKey("investigated_suspects"),
        sKey("solved_followups"),
        sKey("indictment_solved"),
        sKey("indictment_culprit"),
        sKey("reinvestigate_unlocked"),
        sKey("reinvestigate_opened"),
        sKey("phone_inputs"),
        sKey("phone_solved"),
      ].forEach(removeStorageItem);
    }
  };

  const handleOpenReinvestigation = useCallback(() => {
    setIsReinvestigateModalOpen(true);
    setHasOpenedReinvestigation(true);
    setStorageItem(sKey("reinvestigate_opened"), "true");
    if (opts?.onOpenReinvestigation) {
      opts.onOpenReinvestigation();
    }
  }, [opts?.onOpenReinvestigation, sKey]);

  const effectiveReinvestigateUnlocked =
    isShowAllPinsPreview || isReinvestigateUnlocked;
  const effectivePhoneSolved = isShowAllPinsPreview || phoneLookupSuccess;
  const effectiveIndictmentSolved = isShowAllPinsPreview || isIndictmentSolved;

  return {
    caseId,
    checkpoints,
    suspects,
    setSuspects,
    saveSuspectsState,
    handleSaveSuspect,
    handleDeleteSuspect,
    isReinvestigateUnlocked,
    setIsReinvestigateUnlocked,
    isReinvestigateModalOpen,
    setIsReinvestigateModalOpen,
    hasOpenedReinvestigation,
    setHasOpenedReinvestigation,
    phoneLookupSuccess,
    setPhoneLookupSuccess,
    isShowAllPinsPreview,
    setIsShowAllPinsPreview,
    isIndictmentSolved,
    setIsIndictmentSolved,
    solvedCulprit,
    setSolvedCulprit,
    isEpilogueOpen,
    setIsEpilogueOpen,
    isFinalEpilogueOpen,
    setIsFinalEpilogueOpen,
    isDossierOpen,
    setIsDossierOpen,
    activeDossierType,
    setActiveDossierType,
    isFollowupQuestionOpen,
    setIsFollowupQuestionOpen,
    isEvidenceGuideOpen,
    setIsEvidenceGuideOpen,
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
    handleOpenDossier,
    handleResetAll,
    handleOpenReinvestigation,
    effectiveReinvestigateUnlocked,
    effectivePhoneSolved,
    effectiveIndictmentSolved,
  };
}
