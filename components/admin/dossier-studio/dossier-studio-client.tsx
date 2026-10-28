"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import type {
  DossierMode,
  PaperConfig,
  QABlock,
  LoiKhaiData,
  LyLichData,
} from "@/types/dossier";
import {
  getDossierDocuments,
  reorderDossierDocuments,
  saveDossierDocumentsBatch,
  type DbDossierDocument,
} from "@/lib/actions/dossier-actions";
import type {
  DbCase,
  DbCaseDossier,
  DbCaseEvidence,
  DbCaseWithEvidenceConfig,
} from "@/lib/types/database";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
  deleteCaseDossier,
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import {
  getCaseEvidence,
  deleteCaseEvidence,
  getCase360Config,
  upsertMultipleCaseEvidence,
} from "@/lib/actions/evidence-actions";
import { DossierListPanel } from "./dossier-list-panel";
import { DossierConfigModal } from "./dossier-config-modal";
import { DossierStudioHeader } from "./dossier-studio-header";
import { DossierLoiKhaiSheet } from "./dossier-loi-khai-sheet";
import { DossierLyLichSheet } from "./dossier-ly-lich-sheet";
import { DossierStudioSidebar } from "./dossier-studio-sidebar";
import { DossierEvidenceCard } from "./dossier-evidence-card";
import { Scene360ConfigModal } from "@/components/admin/evidence-studio/scene-360-config-modal";
import { UserCheck, FileText, Camera, Plus, X } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface DossierStudioClientProps {
  initialCaseId?: string;
  initialCases?: DbCase[];
  initialLkDocuments?: DbDossierDocument[];
  initialHsDocuments?: DbDossierDocument[];
  initialDossiers?: DbCaseDossier[];
  initialAvailableDocuments?: AvailableDocumentItem[];
  initialEvidence?: DbCaseEvidence[];
  initial360Config?: DbCaseWithEvidenceConfig | null;
}

const EMPTY_LK: LoiKhaiData = {
  tagCode: "",
  docTitle: "BIÊN BẢN GHI LỜI KHAI",
  caseSubtitle: "",
  recordLead: "",
  investigatorText: "",
  subjectName: "",
  reasonText: "",
  relationText: "",
  qaList: [],
};

const EMPTY_HS: LyLichData = {
  tagCode: "",
  idCode: "",
  photoUrl: "",
  fullName: "",
  nickname: "",
  dob: "",
  gender: "",
  cmnd: "",
  permanentAddress: "",
  currentAddress: "",
  job: "",
  phone: "",
  maritalStatus: "",
  identifyingTraits: "",
  criminalRecord: "",
  relationWithVictim: "",
  archiveNote: "",
  caseFileNumber: "",
  archiveStatus: "",
  signingCity: "TP. HỒ CHÍ MINH",
  signingDay: "",
  signingMonth: "",
  signingYear: "",
  investigatorRankAndName: "",
};

// Khổ giấy cố định chuẩn in ấn tư pháp: Lời khai A4 Dọc, Lý lịch A4 Ngang
const FIXED_LK_PAPER: PaperConfig = {
  size: "A4",
  orientation: "portrait",
};

const FIXED_HS_PAPER: PaperConfig = {
  size: "A4",
  orientation: "landscape",
};

export function DossierStudioClient({
  initialCaseId = "case_000",
  initialCases = [],
  initialLkDocuments = [],
  initialHsDocuments = [],
  initialDossiers = [],
  initialAvailableDocuments = [],
  initialEvidence = [],
  initial360Config = null,
}: DossierStudioClientProps) {
  const [dossiers, setDossiers] = useState<DbCaseDossier[]>(initialDossiers);
  const [availableDocs, setAvailableDocs] = useState<AvailableDocumentItem[]>(
    initialAvailableDocuments,
  );
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingDossier, setEditingDossier] = useState<DbCaseDossier | null>(
    null,
  );
  const [activeDossierFilterKey, setActiveDossierFilterKey] = useState<
    string | null
  >(null);
  const [caseId, setCaseId] = useState<string>(initialCaseId);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Danh sách hồ sơ & chứng cứ trên cùng một canvas:
  const [hsDocuments, setHsDocuments] =
    useState<DbDossierDocument[]>(initialHsDocuments);
  const [lkDocuments, setLkDocuments] =
    useState<DbDossierDocument[]>(initialLkDocuments);
  const [evidenceList, setEvidenceList] =
    useState<DbCaseEvidence[]>(initialEvidence);

  // Cấu hình không gian 360 độ hiện trường
  const [config360, setConfig360] =
    useState<DbCaseWithEvidenceConfig | null>(initial360Config);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  // Lightbox xem ảnh lớn
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Phân loại mục đang được chọn ở Sidebar ('ly_lich' | 'loi_khai' | 'evidence')
  const [activeSectionType, setActiveSectionType] = useState<
    "ly_lich" | "loi_khai" | "evidence"
  >("ly_lich");

  // Nạp lại dữ liệu khi chuyển caseId
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoadingData(true);
      try {
        const [dList, cList, hsRes, lkRes, evRes, c360Res] = await Promise.all([
          getCaseDossiers(caseId),
          getAllCaseDocumentsCatalog(caseId),
          getDossierDocuments(caseId, "ly_lich"),
          getDossierDocuments(caseId, "loi_khai"),
          getCaseEvidence(caseId),
          getCase360Config(caseId),
        ]);
        if (isMounted) {
          setDossiers(dList);
          setAvailableDocs(cList);
          if (hsRes.success && hsRes.data) setHsDocuments(hsRes.data);
          if (lkRes.success && lkRes.data) setLkDocuments(lkRes.data);
          if (evRes.success && evRes.data) setEvidenceList(evRes.data);
          if (c360Res.success) setConfig360(c360Res.data);
        }
      } catch (err) {
        console.error("Failed to load dossiers for case:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [caseId]);

  // Giữ vụ án đang chọn trên URL (?case=)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("case") === caseId) return;
    url.searchParams.set("case", caseId);
    window.history.replaceState(null, "", url);
  }, [caseId]);

  // Bộ hồ sơ CRUD Handlers
  const handleCreateDossier = useCallback(() => {
    setEditingDossier({
      id: "",
      case_id: caseId,
      dossier_key: "",
      title: "",
      document_codes: [],
      flow_position: null,
      description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsConfigModalOpen(true);
  }, [caseId]);

  const handleEditDossier = useCallback((d: DbCaseDossier) => {
    setEditingDossier(d);
    setIsConfigModalOpen(true);
  }, []);

  const handleDeleteDossier = useCallback(
    async (dossierKey: string) => {
      try {
        const res = await deleteCaseDossier(caseId, dossierKey);
        if (res.ok) {
          setDossiers((prev) =>
            prev.filter((d) => d.dossier_key !== dossierKey),
          );
        } else {
          alert("Lỗi xóa bộ hồ sơ: " + (res.error || ""));
        }
      } catch (err) {
        console.error("Error deleting dossier:", err);
      }
    },
    [caseId],
  );

  const handleDossierSaved = useCallback((saved: DbCaseDossier) => {
    setDossiers((prev) => {
      const idx = prev.findIndex((d) => d.dossier_key === saved.dossier_key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }, []);

  // Tag code được chọn hiện tại
  const [selectedTagCode, setSelectedTagCode] = useState<string>(
    initialHsDocuments[0]?.tag_code ||
      initialLkDocuments[0]?.tag_code ||
      initialEvidence[0]?.code ||
      "A-17",
  );

  // Vật chứng đang chọn
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    initialEvidence[0]?.id || null,
  );

  const selectedEvidence = useMemo(() => {
    if (selectedEvidenceId) {
      return evidenceList.find((e) => e.id === selectedEvidenceId) || null;
    }
    return evidenceList.find((e) => e.code === selectedTagCode) || null;
  }, [evidenceList, selectedEvidenceId, selectedTagCode]);

  const initialLk =
    (initialLkDocuments.find((d) => d.tag_code === selectedTagCode)
      ?.content as LoiKhaiData) ||
    (initialLkDocuments[0]?.content as LoiKhaiData) ||
    EMPTY_LK;

  const initialHs =
    (initialHsDocuments.find((d) => d.tag_code === selectedTagCode)
      ?.content as LyLichData) ||
    (initialHsDocuments[0]?.content as LyLichData) ||
    EMPTY_HS;

  const [lkData, setLkData] = useState<LoiKhaiData>(initialLk);
  const [hsData, setHsData] = useState<LyLichData>(initialHs);

  const [isSavingDb, setIsSavingDb] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  // Lọc theo bộ hồ sơ (nếu người dùng bấm chọn 1 bộ ở panel bên trái)
  const activeDossier = useMemo(() => {
    if (!activeDossierFilterKey) return null;
    return (
      dossiers.find((d) => d.dossier_key === activeDossierFilterKey) || null
    );
  }, [dossiers, activeDossierFilterKey]);

  const displayedHsDocs = useMemo(() => {
    if (!activeDossier) return hsDocuments;
    return hsDocuments.filter((d) =>
      activeDossier.document_codes.includes(d.tag_code),
    );
  }, [hsDocuments, activeDossier]);

  const displayedLkDocs = useMemo(() => {
    if (!activeDossier) return lkDocuments;
    return lkDocuments.filter((d) =>
      activeDossier.document_codes.includes(d.tag_code),
    );
  }, [lkDocuments, activeDossier]);

  // Lọc sạch danh mục Vật Chứng & Ảnh:
  // 1. Chỉ gồm 2 loại: Ảnh hoặc PDF từ bên ngoài
  // 2. Không chứa avatar nhân vật (avatar_*) hoặc marker crime_scene
  // 3. Tuyệt đối không lặp lại hồ sơ Lý Lịch hoặc Lời Khai đã soạn trong Studio
  const cleanEvidenceList = useMemo(() => {
    const docCodes = new Set([
      ...hsDocuments.map((d) => (d.tag_code || "").trim().toUpperCase()),
      ...lkDocuments.map((d) => (d.tag_code || "").trim().toUpperCase()),
    ]);

    return evidenceList.filter((e) => {
      const code = (e.code || "").trim().toUpperCase();
      if (!code || code.startsWith("AVATAR_") || code === "CRIME_SCENE") {
        return false;
      }
      if (docCodes.has(code)) {
        return false;
      }
      const title = (e.title || "").toLowerCase();
      if (
        title.includes("lời khai") ||
        title.includes("lý lịch") ||
        title.includes("trích lục") ||
        title.includes("biên bản lấy lời khai")
      ) {
        return false;
      }
      return true;
    });
  }, [evidenceList, hsDocuments, lkDocuments]);

  const displayedEvidence = useMemo(() => {
    if (!activeDossier) return cleanEvidenceList;
    return cleanEvidenceList.filter((e) =>
      activeDossier.document_codes.includes(e.code),
    );
  }, [cleanEvidenceList, activeDossier]);

  // Pan & Zoom Engine
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const zoomScaleRef = useRef(zoomScale);
  zoomScaleRef.current = zoomScale;
  const panRef = useRef(pan);
  panRef.current = pan;

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isSpacePressedRef = useRef(false);

  const [showSeal, setShowSeal] = useState(true);
  const [sealAngle, setSealAngle] = useState(-5);
  const [highlightEditable, setHighlightEditable] = useState(true);

  // Lưu toàn bộ dữ liệu Lời Khai, Lý Lịch & Vật Chứng vào Database Supabase (Batch Save)
  const handleSaveData = useCallback(async () => {
    setIsSavingDb(true);
    try {
      const allDocs = [
        ...hsDocuments.map((d) => ({
          caseId,
          mode: "ly_lich" as DossierMode,
          tagCode: d.tag_code,
          subjectName:
            d.tag_code === hsData.tagCode ? hsData.fullName : d.subject_name,
          paperConfig: FIXED_HS_PAPER,
          content:
            d.tag_code === hsData.tagCode ? hsData : (d.content as LyLichData),
        })),
        ...lkDocuments.map((d) => ({
          caseId,
          mode: "loi_khai" as DossierMode,
          tagCode: d.tag_code,
          subjectName:
            d.tag_code === lkData.tagCode
              ? lkData.subjectName
              : d.subject_name,
          paperConfig: FIXED_LK_PAPER,
          content:
            d.tag_code === lkData.tagCode ? lkData : (d.content as LoiKhaiData),
        })),
      ];

      const [resDocs, resEv] = await Promise.all([
        saveDossierDocumentsBatch(allDocs),
        upsertMultipleCaseEvidence(caseId, evidenceList),
      ]);

      if (resDocs.success && resEv.success) {
        setSavedNotification(true);
        setTimeout(() => setSavedNotification(false), 2500);
        if (resDocs.data && resDocs.data.length > 0) {
          setHsDocuments(resDocs.data.filter((d) => d.mode === "ly_lich"));
          setLkDocuments(resDocs.data.filter((d) => d.mode === "loi_khai"));
        }
        if (resEv.data && resEv.data.length > 0) {
          setEvidenceList(resEv.data);
        }
        toast.success("Đã lưu toàn bộ tài liệu & chứng cứ!");
      } else {
        const errorMsg = [resDocs.error, resEv.error].filter(Boolean).join("; ");
        toast.error("Lỗi lưu vào Database: " + (errorMsg || "Vui lòng thử lại"));
      }
    } catch (e: unknown) {
      console.error("Failed to save to Supabase:", e);
      toast.error("Không thể kết nối đến Database!");
    } finally {
      setIsSavingDb(false);
    }
  }, [caseId, hsDocuments, lkDocuments, evidenceList, hsData, lkData]);

  // Kéo thả sắp xếp lại thứ tự hồ sơ (cho từng nhóm)
  const handleReorderDocuments = useCallback(
    async (
      targetMode: DossierMode,
      sourceIndex: number,
      targetIndex: number,
    ) => {
      const list = targetMode === "ly_lich" ? [...hsDocuments] : [...lkDocuments];
      if (
        sourceIndex === targetIndex ||
        sourceIndex < 0 ||
        sourceIndex >= list.length ||
        targetIndex < 0 ||
        targetIndex >= list.length
      ) {
        return;
      }

      const [movedItem] = list.splice(sourceIndex, 1);
      list.splice(targetIndex, 0, movedItem);

      const reorderedPayload = list.map((doc, idx) => ({
        id: doc.id,
        sortOrder: idx,
        content: {
          ...(doc.content as unknown as Record<string, unknown>),
          sortOrder: idx,
        },
      }));

      const updatedDocs = list.map((doc, idx) => ({
        ...doc,
        content: {
          ...doc.content,
          sortOrder: idx,
        } as LoiKhaiData | LyLichData,
      }));

      if (targetMode === "ly_lich") {
        setHsDocuments(updatedDocs);
      } else {
        setLkDocuments(updatedDocs);
      }

      try {
        await reorderDossierDocuments(reorderedPayload);
      } catch (err) {
        console.warn("Could not persist reorder to database:", err);
      }
    },
    [hsDocuments, lkDocuments],
  );

  // Cập nhật dữ liệu trực tiếp từ thẻ Canvas
  const updateMatrixLkDocument = useCallback(
    (tagCode: string, updater: (prev: LoiKhaiData) => LoiKhaiData) => {
      setSelectedTagCode(tagCode);
      setActiveSectionType("loi_khai");
      setLkData((prev) => {
        const current =
          prev.tagCode === tagCode
            ? prev
            : (lkDocuments.find((d) => d.tag_code === tagCode)
                ?.content as LoiKhaiData) || EMPTY_LK;
        return updater(current);
      });
      setLkDocuments((prevDocs) =>
        prevDocs.map((doc) => {
          if (doc.tag_code === tagCode) {
            const currentContent = (doc.content as LoiKhaiData) || EMPTY_LK;
            const updatedContent = updater(currentContent);
            return {
              ...doc,
              subject_name: updatedContent.subjectName || doc.subject_name,
              content: updatedContent,
            };
          }
          return doc;
        }),
      );
    },
    [lkDocuments],
  );

  const updateMatrixHsDocument = useCallback(
    (tagCode: string, updater: (prev: LyLichData) => LyLichData) => {
      setSelectedTagCode(tagCode);
      setActiveSectionType("ly_lich");
      setHsData((prev) => {
        const current =
          prev.tagCode === tagCode
            ? prev
            : (hsDocuments.find((d) => d.tag_code === tagCode)
                ?.content as LyLichData) || EMPTY_HS;
        return updater(current);
      });
      setHsDocuments((prevDocs) =>
        prevDocs.map((doc) => {
          if (doc.tag_code === tagCode) {
            const currentContent = (doc.content as LyLichData) || EMPTY_HS;
            const updatedContent = updater(currentContent);
            return {
              ...doc,
              subject_name: updatedContent.fullName || doc.subject_name,
              content: updatedContent,
            };
          }
          return doc;
        }),
      );
    },
    [hsDocuments],
  );

  // Container canvas ref
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener for Space (Hold Space to Pan canvas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space" && !e.repeat) {
        setIsSpacePressed(true);
        isSpacePressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Vector Zoom & Wheel Listener
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
        const currentZoom = zoomScaleRef.current;
        const newZoom = Math.min(
          2.5,
          Math.max(0.25, Math.round(currentZoom * zoomFactor * 100) / 100),
        );
        if (newZoom === currentZoom) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const currentPan = panRef.current;
        const newPan = {
          x: mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom),
          y: mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom),
        };

        panRef.current = newPan;
        zoomScaleRef.current = newZoom;
        setPan(newPan);
        setZoomScale(newZoom);
      } else {
        const currentPan = panRef.current;
        const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
        const deltaY = e.shiftKey ? 0 : e.deltaY;

        const newPan = {
          x: currentPan.x - deltaX,
          y: currentPan.y - deltaY,
        };
        panRef.current = newPan;
        setPan(newPan);
      }
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onNativeWheel);
    };
  }, []);

  // Mouse Drag to Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target?.isContentEditable ||
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.closest("button") ||
      target?.closest("select")
    ) {
      return;
    }

    if (e.button === 1 || isSpacePressedRef.current || e.button === 0) {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    const newPan = {
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    };
    panRef.current = newPan;
    setPan(newPan);
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // Zoom helpers
  const handleZoomIn = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const currentZoom = zoomScaleRef.current;
    const newZoom = Math.min(2.5, Math.round(currentZoom * 1.2 * 10) / 10);
    const currentPan = panRef.current;
    const newPan = {
      x: centerX - (centerX - currentPan.x) * (newZoom / currentZoom),
      y: centerY - (centerY - currentPan.y) * (newZoom / currentZoom),
    };
    panRef.current = newPan;
    zoomScaleRef.current = newZoom;
    setPan(newPan);
    setZoomScale(newZoom);
  }, []);

  const handleZoomOut = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const currentZoom = zoomScaleRef.current;
    const newZoom = Math.max(0.25, Math.round((currentZoom / 1.2) * 10) / 10);
    const currentPan = panRef.current;
    const newPan = {
      x: centerX - (centerX - currentPan.x) * (newZoom / currentZoom),
      y: centerY - (centerY - currentPan.y) * (newZoom / currentZoom),
    };
    panRef.current = newPan;
    zoomScaleRef.current = newZoom;
    setPan(newPan);
    setZoomScale(newZoom);
  }, []);

  const handleResetZoom = useCallback(() => {
    panRef.current = { x: 40, y: 30 };
    zoomScaleRef.current = 1;
    setPan({ x: 40, y: 30 });
    setZoomScale(1);
  }, []);

  const handleSetPhysicalScale = useCallback(() => {
    const targetScale = 1.0;
    panRef.current = { x: 40, y: 30 };
    zoomScaleRef.current = targetScale;
    setPan({ x: 40, y: 30 });
    setZoomScale(targetScale);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // LK manipulation
  const addLkQuestion = (index?: number) => {
    const newQ: QABlock = {
      id: `q_${Date.now()}`,
      question:
        "............................................................................",
      answer:
        "............................................................................",
    };
    const updated = [...lkData.qaList];
    if (typeof index === "number") {
      updated.splice(index + 1, 0, newQ);
    } else {
      updated.push(newQ);
    }
    setLkData((prev) => ({ ...prev, qaList: updated }));
    setLkDocuments((docs) =>
      docs.map((d) =>
        d.tag_code === lkData.tagCode
          ? { ...d, content: { ...lkData, qaList: updated } }
          : d,
      ),
    );
  };

  const estimatedLkPages = useMemo(() => {
    const qaList = lkData.qaList || [];
    if (qaList.length === 0) return 1;

    const maxWeightP1 = 765;
    const maxWeightNext = 890;
    const charsPerLine = 78;
    const lineHeightPx = 20;

    let pagesCount = 1;
    let currentWeight = 0;
    let currentLimit = maxWeightP1;

    for (let i = 0; i < qaList.length; i++) {
      const item = qaList[i];
      const qLen = (item.question || "").length;
      const aLen = (item.answer || "").length;
      const qLines = Math.max(1, Math.ceil(qLen / charsPerLine));
      const aLines = Math.max(1, Math.ceil(aLen / charsPerLine));
      const weight = 48 + (qLines + aLines) * lineHeightPx + 12;

      if (currentWeight + weight > currentLimit && currentWeight > 0) {
        pagesCount++;
        currentWeight = weight;
        currentLimit = maxWeightNext;
      } else {
        currentWeight += weight;
      }
    }

    return pagesCount;
  }, [lkData.qaList]);

  // Cuộn/pan camera tới tài liệu được chọn trên Canvas chung (hỗ trợ cả 2 trục X và Y)
  const focusOnDossier = useCallback((tagCode: string) => {
    requestAnimationFrame(() => {
      const container = canvasContainerRef.current;
      const el = document.getElementById(`doc-sheet-${tagCode}`);
      if (!container || !el) return;

      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const currentZoom = zoomScaleRef.current;
      const currentPan = panRef.current;

      const elementLocalX =
        (elRect.left - containerRect.left - currentPan.x) / currentZoom;
      const elementLocalY =
        (elRect.top - containerRect.top - currentPan.y) / currentZoom;
      const elementWidth = elRect.width / currentZoom;

      const targetPanX = Math.round(
        containerRect.width / 2 -
          (elementLocalX + elementWidth / 2) * currentZoom,
      );
      const targetPanY = Math.round(40 - elementLocalY * currentZoom);

      const newPan = { x: targetPanX, y: targetPanY };
      panRef.current = newPan;
      setPan(newPan);
    });
  }, []);

  // Chọn hồ sơ từ sidebar hoặc click sheet
  const handleSelectDossier = (selectedTag: string) => {
    setSelectedTagCode(selectedTag);
    const targetHs = hsDocuments.find((d) => d.tag_code === selectedTag);
    const targetLk = lkDocuments.find((d) => d.tag_code === selectedTag);
    if (targetHs) {
      setActiveSectionType("ly_lich");
      setHsData(targetHs.content as LyLichData);
    } else if (targetLk) {
      setActiveSectionType("loi_khai");
      setLkData(targetLk.content as LoiKhaiData);
    }
    focusOnDossier(selectedTag);
  };

  // Chọn vật chứng từ sidebar hoặc click card trên canvas
  const handleSelectEvidence = (item: DbCaseEvidence) => {
    setSelectedEvidenceId(item.id);
    setSelectedTagCode(item.code);
    setActiveSectionType("evidence");
    focusOnDossier(item.code);
  };

  // Tạo vật chứng mới
  const handleCreateNewEvidence = useCallback(() => {
    const existingCodes = evidenceList.map((e) => e.code);
    let newCode = "VC-NEW";
    let counter = 1;
    while (existingCodes.includes(newCode)) {
      newCode = `VC-${String(counter).padStart(2, "0")}`;
      counter++;
    }
    const newId = `temp-ev-${Date.now()}`;
    const newEv: DbCaseEvidence = {
      id: newId,
      case_slug: caseId,
      code: newCode,
      title: "Vật chứng mới",
      kind: "photo",
      description: "",
      file_url: "",
      thumb_url: "",
      metadata: {},
      phase: 1,
      slot_index: evidenceList.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvidenceList((prev) => [...prev, newEv]);
    setSelectedEvidenceId(newId);
    setSelectedTagCode(newCode);
    setActiveSectionType("evidence");
    setTimeout(() => focusOnDossier(newCode), 100);
  }, [evidenceList, caseId, focusOnDossier]);

  // Cập nhật thông tin chứng cứ theo thời gian thực từ Sidebar
  const handleEvidenceChange = useCallback(
    (updated: Partial<DbCaseEvidence>) => {
      setEvidenceList((prev) =>
        prev.map((item) =>
          (selectedEvidenceId && item.id === selectedEvidenceId) ||
          (selectedTagCode && item.code === selectedTagCode)
            ? { ...item, ...updated }
            : item,
        ),
      );
    },
    [selectedEvidenceId, selectedTagCode],
  );

  // Lưu vật chứng riêng lẻ (khi cần)
  const handleSaveEvidence = (saved: DbCaseEvidence) => {
    setEvidenceList((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id || e.code === saved.code);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setSelectedEvidenceId(saved.id);
    setSelectedTagCode(saved.code);
    toast.success(`Đã lưu vật chứng ${saved.code}`);
    setTimeout(() => focusOnDossier(saved.code), 100);
  };

  // Xóa vật chứng
  const handleDeleteEvidence = async (id: string) => {
    try {
      const res = await deleteCaseEvidence(id);
      if (res.success) {
        setEvidenceList((prev) => prev.filter((e) => e.id !== id));
        setSelectedEvidenceId(null);
        toast.success("Đã xóa vật chứng");
      } else {
        toast.error("Lỗi khi xóa: " + (res.error || ""));
      }
    } catch (err) {
      console.error("Failed to delete evidence:", err);
    }
  };

  // Tạo văn bản mới
  const handleCreateNewDocument = (type: DossierMode) => {
    if (type === "ly_lich") {
      setActiveSectionType("ly_lich");
      const existingCodes = hsDocuments.map((d) => d.tag_code);
      let newTag = "HS-NEW";
      let counter = 1;
      while (existingCodes.includes(newTag)) {
        newTag = `HS-${String(counter).padStart(2, "0")}`;
        counter++;
      }

      const newHs: LyLichData = {
        ...EMPTY_HS,
        tagCode: newTag,
        fullName: "Đối tượng mới",
        signingCity: "TP. HỒ CHÍ MINH",
        signingDay: String(new Date().getDate()).padStart(2, "0"),
        signingMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
        signingYear: String(new Date().getFullYear()),
        investigatorRankAndName: "Cán bộ điều tra",
      };
      const newDocItem: DbDossierDocument = {
        id: `temp-${Date.now()}`,
        case_id: caseId,
        mode: "ly_lich",
        tag_code: newTag,
        subject_name: newHs.fullName,
        paper_config: FIXED_HS_PAPER,
        content: newHs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setHsDocuments((prev) => [...prev, newDocItem]);
      setSelectedTagCode(newTag);
      setHsData(newHs);
      setTimeout(() => focusOnDossier(newTag), 100);
    } else {
      setActiveSectionType("loi_khai");
      const existingCodes = lkDocuments.map((d) => d.tag_code);
      let newTag = "LK-NEW";
      let counter = 1;
      while (existingCodes.includes(newTag)) {
        newTag = `LK-${String(counter).padStart(2, "0")}`;
        counter++;
      }

      const newLk: LoiKhaiData = {
        ...EMPTY_LK,
        tagCode: newTag,
        docTitle: "BIÊN BẢN GHI LỜI KHAI",
        subjectName: "Người khai mới",
        caseSubtitle: "V/v: Vụ án điều tra",
        recordLead:
          "Hồi ... giờ ... ngày ... tháng ... năm ..., tại Cơ quan CSĐT",
        investigatorText: "Cán bộ thụ lý hồ sơ",
        reasonText: "Lấy lời khai phục vụ công tác điều tra",
        relationText: "Nhân chứng / Người liên quan",
        qaList: [
          {
            id: `qa-${Date.now()}`,
            question:
              "Hỏi: Đề nghị anh/chị trình bày rõ sự việc đã chứng kiến?",
            answer: "Đáp: Vào thời điểm xảy ra vụ việc, tôi...",
          },
        ],
      };
      const newDocItem: DbDossierDocument = {
        id: `temp-${Date.now()}`,
        case_id: caseId,
        mode: "loi_khai",
        tag_code: newTag,
        subject_name: newLk.subjectName,
        paper_config: FIXED_LK_PAPER,
        content: newLk,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLkDocuments((prev) => [...prev, newDocItem]);
      setSelectedTagCode(newTag);
      setLkData(newLk);
      setTimeout(() => focusOnDossier(newTag), 100);
    }
  };

  return (
    <div
      data-studio-ready={isLoadingData ? "false" : "true"}
      className="h-full w-full bg-[#0a0a0d] text-zinc-100 flex flex-col overflow-hidden font-sans antialiased selection:bg-amber-500/30"
    >
      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          *,
          *::before,
          *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html,
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          div[class*="h-screen"],
          main,
          div[class*="flex-1"],
          div[class*="min-w-fit"] {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            display: block !important;
            width: 100% !important;
          }
          div[style*="transform"] {
            transform: none !important;
            gap: 0 !important;
            display: block !important;
          }
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-canvas-lk {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            min-height: 100vh !important;
            height: 100% !important;
            max-width: 100% !important;
            padding: 18mm 20mm !important;
            margin: 0 !important;
            transform: none !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-canvas-hs {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            min-height: 100vh !important;
            height: 100% !important;
            max-width: 100% !important;
            padding: 8mm 8mm !important;
            margin: 0 !important;
            transform: none !important;
            box-sizing: border-box !important;
            display: flex !important;
          }
          .editable-field-indicator {
            background-color: transparent !important;
            border-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
        }
      `}</style>

      {/* Header Controller */}
      <DossierStudioHeader
        caseId={caseId}
        setCaseId={setCaseId}
        initialCases={initialCases}
        highlightEditable={highlightEditable}
        setHighlightEditable={setHighlightEditable}
        zoomScale={zoomScale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onSetPhysicalScale={handleSetPhysicalScale}
        onSaveData={handleSaveData}
        isSavingDb={isSavingDb}
        savedNotification={savedNotification}
        onPrint={handlePrint}
        onOpen360Config={() => setIs360ModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden">
        {/* Cột trái: Bộ hồ sơ */}
        <DossierListPanel
          dossiers={dossiers}
          caseId={caseId}
          onEditDossier={handleEditDossier}
          onCreateDossier={handleCreateDossier}
          onDeleteDossier={handleDeleteDossier}
          activeDossierKey={activeDossierFilterKey}
          onSelectDossier={(d) => {
            setActiveDossierFilterKey((prev) =>
              prev === d.dossier_key ? null : d.dossier_key,
            );
          }}
        />

        {/* Center Workspace: Infinite Vector Canvas chứa cả Lý Lịch, Lời Khai & Vật Chứng */}
        <main
          ref={canvasContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={cn(
            "flex-1 h-full min-h-0 overflow-hidden bg-[#0a0c0e] relative select-none",
            isSpacePressed
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-default",
          )}
        >
          {/* Infinite Vector Surface Transform Layer */}
          <div
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoomScale})`,
              transformOrigin: "0 0",
              willChange: "transform",
              transition: isPanningRef.current
                ? "none"
                : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="absolute top-0 left-0 min-w-fit min-h-fit p-10 flex flex-col gap-16 select-text"
          >
            {/* Thanh thông báo đang lọc theo bộ hồ sơ (nếu có) */}
            {activeDossier && (
              <div className="sticky left-0 top-0 z-20 flex items-center gap-2.5 bg-amber-950/80 border border-amber-500/50 text-amber-200 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-semibold w-fit shadow-lg">
                <span>
                  Đang xem bộ hồ sơ:{" "}
                  <strong className="text-white text-sm">
                    {activeDossier.title || activeDossier.dossier_key}
                  </strong>{" "}
                  ({displayedHsDocs.length + displayedLkDocs.length + displayedEvidence.length} tài liệu & vật chứng)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDossierFilterKey(null)}
                  className="ml-2 px-2 py-0.5 rounded bg-black/50 hover:bg-black/80 text-amber-300 hover:text-white text-[11px] font-bold transition-all border border-amber-400/30"
                >
                  ✕ Xem tất cả
                </button>
              </div>
            )}

            {/* PHÂN KHU 1: HỒ SƠ LÝ LỊCH (A4 NGANG) */}
            <div id="canvas-ly-lich-section" className="flex flex-col gap-4">
              <div className="sticky left-0 z-10 flex items-center gap-2.5 bg-[#141618]/90 border border-white/10 px-3.5 py-1.5 rounded-lg w-fit backdrop-blur-md shadow-sm">
                <UserCheck className="size-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                  Hồ Sơ Lý Lịch ({displayedHsDocs.length})
                </span>
                <span className="text-[10px] text-neutral-400 font-mono border-l border-white/10 pl-2">
                  A4 Ngang
                </span>
              </div>
              <div className="flex flex-row items-start gap-12">
                {displayedHsDocs.map((docItem) => {
                  const isSelected =
                    activeSectionType === "ly_lich" &&
                    selectedTagCode === docItem.tag_code;
                  const docData = (
                    isSelected ? hsData : docItem.content
                  ) as LyLichData;

                  return (
                    <DossierLyLichSheet
                      key={docItem.id}
                      docItem={docItem}
                      docData={docData}
                      docPaper={FIXED_HS_PAPER}
                      isSelected={isSelected}
                      highlightEditable={highlightEditable}
                      showSeal={showSeal}
                      sealAngle={sealAngle}
                      onSelect={() => {
                        setSelectedTagCode(docItem.tag_code);
                        setActiveSectionType("ly_lich");
                        setHsData(docItem.content as LyLichData);
                      }}
                      onUpdateDoc={updateMatrixHsDocument}
                    />
                  );
                })}
              </div>
            </div>

            {/* PHÂN KHU 2: BIÊN BẢN GHI LỜI KHAI (A4 DỌC) */}
            <div id="canvas-loi-khai-section" className="flex flex-col gap-4">
              <div className="sticky left-0 z-10 flex items-center gap-2.5 bg-[#141618]/90 border border-white/10 px-3.5 py-1.5 rounded-lg w-fit backdrop-blur-md shadow-sm">
                <FileText className="size-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                  Biên Bản Ghi Lời Khai ({displayedLkDocs.length})
                </span>
                <span className="text-[10px] text-neutral-400 font-mono border-l border-white/10 pl-2">
                  A4 Dọc
                </span>
              </div>
              <div className="flex flex-row items-start gap-12">
                {displayedLkDocs.map((docItem) => {
                  const isSelected =
                    activeSectionType === "loi_khai" &&
                    selectedTagCode === docItem.tag_code;
                  const docData = (
                    isSelected ? lkData : docItem.content
                  ) as LoiKhaiData;

                  return (
                    <DossierLoiKhaiSheet
                      key={docItem.id}
                      docItem={docItem}
                      docData={docData}
                      docPaper={FIXED_LK_PAPER}
                      isSelected={isSelected}
                      highlightEditable={highlightEditable}
                      onSelect={() => {
                        setSelectedTagCode(docItem.tag_code);
                        setActiveSectionType("loi_khai");
                        setLkData(docItem.content as LoiKhaiData);
                      }}
                      onUpdateDoc={updateMatrixLkDocument}
                    />
                  );
                })}
              </div>
            </div>

            {/* PHÂN KHU 3: VẬT CHỨNG & ẢNH HIỆN TRƯỜNG */}
            <div id="canvas-evidence-section" className="flex flex-col gap-4">
              <div className="sticky left-0 z-10 flex items-center justify-between bg-[#141618]/90 border border-white/10 px-3.5 py-1.5 rounded-lg w-fit backdrop-blur-md shadow-sm gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="size-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                    Vật Chứng & Ảnh Hiện Trường ({displayedEvidence.length})
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono border-l border-white/10 pl-2">
                    Ảnh / PDF
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewEvidence}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 ml-2"
                >
                  <Plus className="size-3" /> Thêm chứng cứ
                </button>
              </div>

              <div className="flex flex-row items-start gap-8">
                {displayedEvidence.map((item) => {
                  const isSelected =
                    activeSectionType === "evidence" &&
                    (selectedEvidenceId === item.id ||
                      selectedTagCode === item.code);

                  return (
                    <DossierEvidenceCard
                      key={item.id}
                      item={item}
                      isSelected={isSelected}
                      onSelect={() => handleSelectEvidence(item)}
                      onViewImage={(url) => setLightboxUrl(url)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Quản lý cả Lý Lịch, Lời Khai & Chứng Cứ */}
        <DossierStudioSidebar
          caseId={caseId}
          activeSectionType={activeSectionType}
          hsDocuments={displayedHsDocs}
          lkDocuments={displayedLkDocs}
          evidenceList={displayedEvidence}
          selectedTagCode={selectedTagCode}
          selectedEvidence={selectedEvidence}
          onSelectDossier={handleSelectDossier}
          onSelectEvidence={handleSelectEvidence}
          onCreateNewDocument={handleCreateNewDocument}
          onCreateNewEvidence={handleCreateNewEvidence}
          onEvidenceChange={handleEvidenceChange}
          onSaveEvidence={handleSaveEvidence}
          onDeleteEvidence={handleDeleteEvidence}
          onReorderDocuments={handleReorderDocuments}
          lkData={lkData}
          setLkData={setLkData}
          addLkQuestion={addLkQuestion}
          lkPageCount={estimatedLkPages}
          hsData={hsData}
          setHsData={setHsData}
          showSeal={showSeal}
          setShowSeal={setShowSeal}
          sealAngle={sealAngle}
          setSealAngle={setSealAngle}
        />
      </div>

      {/* Modal Cấu hình Bộ hồ sơ */}
      <DossierConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setEditingDossier(null);
        }}
        caseId={caseId}
        dossier={editingDossier}
        availableDocuments={availableDocs}
        onSaved={handleDossierSaved}
      />

      {/* Modal Cấu hình Hiện Trường 360 */}
      <Scene360ConfigModal
        caseId={caseId}
        initialConfig={config360}
        isOpen={is360ModalOpen}
        onClose={() => setIs360ModalOpen(false)}
        onSave={(updated) => {
          setConfig360((prev) => (prev ? { ...prev, ...updated } : null));
          toast.success("Đã cập nhật cấu hình 360");
        }}
      />

      {/* Modal Lightbox Phóng to ảnh */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md cursor-zoom-out animate-in fade-in-0 duration-200"
        >
          <div className="relative max-h-full max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeImageUrl(lightboxUrl)}
              alt="Ảnh phóng to"
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl border border-white/10"
            />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-3 -right-3 rounded-full bg-black/80 p-2 text-white border border-white/20 hover:bg-black transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
