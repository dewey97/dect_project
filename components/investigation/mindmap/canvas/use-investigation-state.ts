"use client";

import { useEffect, useState, useCallback } from "react";
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

export type CulpritKey = "vu" | "tung" | "ha";

export const ALL_CASE_000_SUSPECTS: SuspectItem[] = [
  {
    id: "suspect-vu",
    name: "Lê Quang Vũ",
    clueIds: ["c0-clue-01", "c0-clue-02"],
  },
  { id: "suspect-tung", name: "Nguyễn Thanh Tùng", clueIds: ["c0-clue-03"] },
  { id: "suspect-ha", name: "Trần Thị Hà", clueIds: ["c0-clue-04"] },
  { id: "suspect-mai", name: "Nguyễn Ngọc Mai", clueIds: [] },
  { id: "suspect-dat", name: "Trần Văn Đạt", clueIds: [] },
  { id: "suspect-lua", name: "Nguyễn Thị Lụa", clueIds: [] },
];

export function sanitizeSuspectsList(items: SuspectItem[]): SuspectItem[] {
  const map = new Map<string, SuspectItem>();
  for (const s of items) {
    if (!s || !s.name) continue;
    const matchedChar = findValidCaseCharacter(s.name || s.id);
    if (!matchedChar || matchedChar.id === "khang") continue;
    const { canonicalId, canonicalName } = getCanonicalSuspectKey(s);
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
  onOpenReinvestigation?: () => void;
  onOpenEpilogue?: () => void;
}) {
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

  useEffect(() => {
    const rawSuspects = getStorageJson<any[]>("canvas_suspects", []);
    const validList = rawSuspects.filter((s) => s?.id !== "suspect-default-1");
    setSuspects(sanitizeSuspectsList(validList));

    const solvedFollowups = getStorageJson<CulpritKey[]>(
      "solved_followups",
      [],
    );
    setSolvedFollowupQuestions(solvedFollowups);
    if (
      (solvedFollowups.includes("vu") && solvedFollowups.includes("tung")) ||
      getStorageItem("reinvestigate_unlocked") === "true"
    ) {
      setIsReinvestigateUnlocked(true);
    }
    if (getStorageItem("reinvestigate_opened") === "true") {
      setHasOpenedReinvestigation(true);
    }

    const phoneInputs = getStorageJson<Record<string, string>>(
      "phone_inputs",
      {},
    );
    const isPhoneSolved = getStorageItem("phone_solved") === "true";
    if (
      phoneInputs.phone1 ||
      phoneInputs.phone2 ||
      phoneInputs.phone3 ||
      isPhoneSolved
    ) {
      setPhoneLookupSuccess(true);
    }

    setInvestigatedSuspects(
      getStorageJson<CulpritKey[]>("investigated_suspects", []),
    );

    if (getStorageItem("indictment_solved") === "true") {
      const savedCulprit = getStorageItem(
        "indictment_culprit",
      ) as CulpritKey | null;
      if (savedCulprit) {
        setIsIndictmentSolved(true);
        setSolvedCulprit(savedCulprit);
      }
    }
  }, []);

  const saveSuspectsState = (newSuspects: SuspectItem[]) => {
    const sanitized = sanitizeSuspectsList(newSuspects);
    setSuspects(sanitized);
    setStorageJson("canvas_suspects", sanitized);
  };

  const handleSaveSuspect = (savedSuspect: SuspectItem) => {
    const matchedChar = findValidCaseCharacter(
      savedSuspect.name || savedSuspect.id,
    );
    if (!matchedChar || matchedChar.id === "khang") return;

    const { canonicalId, canonicalName } = getCanonicalSuspectKey(savedSuspect);
    const normalizedItem: SuspectItem = {
      ...savedSuspect,
      id: canonicalId,
      name: canonicalName || savedSuspect.name,
    };

    setSuspects((prev) => {
      const existingIndex = prev.findIndex((s) => {
        const sKey = getCanonicalSuspectKey(s);
        return sKey.canonicalId === canonicalId || s.id === canonicalId;
      });
      let updated: SuspectItem[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = normalizedItem;
      } else {
        updated = [...prev, normalizedItem];
      }
      const sanitized = sanitizeSuspectsList(updated);
      setStorageItem("canvas_suspects", JSON.stringify(sanitized));
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
      const { canonicalId } = getCanonicalSuspectKey(suspectToDelete);
      const culpritType: CulpritKey | null =
        canonicalId === "vu" || canonicalId === "tung" || canonicalId === "ha"
          ? (canonicalId as CulpritKey)
          : null;
      if (culpritType) {
        const remainingHasCulprit = updated.some(
          (s) => getCanonicalSuspectKey(s).canonicalId === culpritType,
        );
        if (!remainingHasCulprit) {
          setInvestigatedSuspects((prev) => {
            const next = prev.filter((c) => c !== culpritType);
            setStorageItem("investigated_suspects", JSON.stringify(next));
            return next;
          });
          if (solvedCulprit === culpritType) {
            setSolvedCulprit(null);
            setIsIndictmentSolved(false);
            removeStorageItem("indictment_solved");
            removeStorageItem("indictment_culprit");
          }
        }
      }
    }
  };

  const handlePhoneLookupSuccess = (_phone: string, _info: string) => {
    setPhoneLookupSuccess(true);
    setStorageItem("phone_solved", "true");
    setIsPhoneLookupOpen(false);
    setIsPhoneNarrativeOpen(true);
  };

  const handleFollowupSuccess = (culprit: CulpritKey, choice?: string) => {
    const updated = Array.from(new Set([...solvedFollowupQuestions, culprit]));
    setSolvedFollowupQuestions(updated);
    setStorageItem("solved_followups", JSON.stringify(updated));
    if (choice) {
      setStorageItem(`followup_${culprit}_choice`, choice);
    }
    if (updated.includes("vu") && updated.includes("tung")) {
      setIsReinvestigateUnlocked(true);
      setStorageItem("reinvestigate_unlocked", "true");
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
    setStorageItem("indictment_solved", "true");
    setStorageItem("indictment_culprit", data.culprit);
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
    clearInvestigationStorage();
  };

  const handleOpenReinvestigation = useCallback(() => {
    setIsReinvestigateModalOpen(true);
    setHasOpenedReinvestigation(true);
    setStorageItem("reinvestigate_opened", "true");
    if (opts?.onOpenReinvestigation) {
      opts.onOpenReinvestigation();
    }
  }, [opts?.onOpenReinvestigation]);

  const effectiveReinvestigateUnlocked =
    isShowAllPinsPreview || isReinvestigateUnlocked;
  const effectivePhoneSolved = isShowAllPinsPreview || phoneLookupSuccess;
  const effectiveIndictmentSolved = isShowAllPinsPreview || isIndictmentSolved;

  return {
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
