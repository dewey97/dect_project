"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";
import type {
  DossierMode,
  PaperConfig,
  QABlock,
  LoiKhaiData,
  LyLichData,
} from "@/types/dossier";
import {
  getDossierDocuments,
  saveDossierDocument,
  reorderDossierDocuments,
  type DbDossierDocument,
} from "@/lib/actions/dossier-actions";
import type { DbCase, DbCaseDossier } from "@/lib/types/database";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
  deleteCaseDossier,
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import { DossierListPanel } from "./dossier-list-panel";
import { DossierConfigModal } from "./dossier-config-modal";

import { DossierStudioHeader } from "./dossier-studio-header";
import { DossierLoiKhaiSheet } from "./dossier-loi-khai-sheet";
import { DossierLyLichSheet } from "./dossier-ly-lich-sheet";
import { DossierStudioSidebar } from "./dossier-studio-sidebar";

interface DossierStudioClientProps {
  initialCaseId?: string;
  initialCases?: DbCase[];
  initialLkDocuments?: DbDossierDocument[];
  initialHsDocuments?: DbDossierDocument[];
  initialDossiers?: DbCaseDossier[];
  initialAvailableDocuments?: AvailableDocumentItem[];
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

export function DossierStudioClient({
  initialCaseId = "case_000",
  initialCases = [],
  initialLkDocuments = [],
  initialHsDocuments = [],
  initialDossiers = [],
  initialAvailableDocuments = [],
}: DossierStudioClientProps) {
  const [dossiers, setDossiers] = useState<DbCaseDossier[]>(initialDossiers);
  const [availableDocs, setAvailableDocs] = useState<AvailableDocumentItem[]>(initialAvailableDocuments);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingDossier, setEditingDossier] = useState<DbCaseDossier | null>(null);
  const [activeDossierFilterKey, setActiveDossierFilterKey] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string>(initialCaseId);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [dList, cList] = await Promise.all([
          getCaseDossiers(caseId),
          getAllCaseDocumentsCatalog(caseId),
        ]);
        if (isMounted) {
          setDossiers(dList);
          setAvailableDocs(cList);
        }
      } catch (err) {
        console.error("Failed to load dossiers for case:", err);
      }
    })();
    return () => { isMounted = false; };
  }, [caseId]);

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
          setDossiers((prev) => prev.filter((d) => d.dossier_key !== dossierKey));
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

  // Giữ vụ án đang chọn trên URL (?case=) để tải lại trang không quay về case_000.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("case") === caseId) return;
    url.searchParams.set("case", caseId);
    window.history.replaceState(null, "", url);
  }, [caseId]);
  const [mode, setMode] = useState<DossierMode>("loi_khai");

  const initialLk = (initialLkDocuments[0]?.content as LoiKhaiData) || EMPTY_LK;
  const initialHs = (initialHsDocuments[0]?.content as LyLichData) || EMPTY_HS;

  const [lkData, setLkData] = useState<LoiKhaiData>(initialLk);
  const [hsData, setHsData] = useState<LyLichData>(initialHs);

  // Khổ giấy & Hướng lưu riêng biệt cho từng loại hồ sơ:
  const [lkPaper, setLkPaper] = useState<PaperConfig>(
    initialLkDocuments[0]?.paper_config || {
      size: "A4",
      orientation: "portrait",
    },
  );
  const [hsPaper, setHsPaper] = useState<PaperConfig>(
    initialHsDocuments[0]?.paper_config || {
      size: "A4",
      orientation: "landscape",
    },
  );

  // Paper config đang active theo mode hiện tại
  const paperSize = mode === "loi_khai" ? lkPaper.size : hsPaper.size;
  const paperOrientation =
    mode === "loi_khai" ? lkPaper.orientation : hsPaper.orientation;

  const setPaperSize = (size: "A4" | "A5") => {
    if (mode === "loi_khai") {
      setLkPaper((prev) => ({ ...prev, size }));
    } else {
      setHsPaper((prev) => ({ ...prev, size }));
    }
    // Đồng bộ khổ giấy cho TOÀN BỘ tài liệu của loại văn bản hiện tại (Lời khai hoặc Lý lịch)
    setDbDocuments((prevDocs) =>
      prevDocs.map((doc) => ({
        ...doc,
        paper_config: {
          ...(doc.paper_config || (mode === "loi_khai" ? lkPaper : hsPaper)),
          size,
        },
      })),
    );
  };

  const setPaperOrientation = (orientation: "portrait" | "landscape") => {
    if (mode === "loi_khai") {
      setLkPaper((prev) => ({ ...prev, orientation }));
    } else {
      setHsPaper((prev) => ({ ...prev, orientation }));
    }
    // Đồng bộ hướng in cho TOÀN BỘ tài liệu của loại văn bản hiện tại (Lời khai hoặc Lý lịch)
    setDbDocuments((prevDocs) =>
      prevDocs.map((doc) => ({
        ...doc,
        paper_config: {
          ...(doc.paper_config || (mode === "loi_khai" ? lkPaper : hsPaper)),
          orientation,
        },
      })),
    );
  };

  // Danh sách hồ sơ đọc trực tiếp từ Database Supabase
  const [dbDocuments, setDbDocuments] = useState<DbDossierDocument[]>(
    initialLkDocuments.length > 0 ? initialLkDocuments : [],
  );
  const [selectedTagCode, setSelectedTagCode] = useState<string>(
    initialLkDocuments[0]?.tag_code || "A-19",
  );
  const [, setIsLoadingDb] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);

  // Fetch danh sách hồ sơ từ Supabase khi mở hoặc khi đổi mode / đổi caseId
  const fetchDossiers = useCallback(
    async (currentMode: DossierMode, targetCaseId: string) => {
      setIsLoadingDb(true);
      try {
        const res = await getDossierDocuments(targetCaseId, currentMode);
        if (res.success && res.data && res.data.length > 0) {
          setDbDocuments(res.data);
          const target =
            res.data.find((d) => d.tag_code === selectedTagCode) || res.data[0];
          if (target) {
            setSelectedTagCode(target.tag_code);
            if (currentMode === "loi_khai") {
              setLkData(target.content as LoiKhaiData);
              if (target.paper_config) setLkPaper(target.paper_config);
            } else {
              setHsData(target.content as LyLichData);
              if (target.paper_config) setHsPaper(target.paper_config);
            }
          }
        } else {
          setDbDocuments([]);
        }
      } catch (e) {
        console.warn("Could not load dossier from Supabase:", e);
      } finally {
        setIsLoadingDb(false);
      }
    },
    [selectedTagCode],
  );

  useEffect(() => {
    fetchDossiers(mode, caseId);
  }, [mode, caseId]);

  // Pan & Zoom Engine (Map Studio / Figma Vector Canvas)
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
  const [savedNotification, setSavedNotification] = useState(false);

  // Nút Lưu Dữ Liệu vào Database Supabase
  const handleSaveData = useCallback(async () => {
    setIsSavingDb(true);
    try {
      const currentTagCode =
        mode === "loi_khai" ? lkData.tagCode : hsData.tagCode;
      const currentSubjectName =
        mode === "loi_khai" ? lkData.subjectName : hsData.fullName;
      const currentPaper = mode === "loi_khai" ? lkPaper : hsPaper;
      const currentContent =
        mode === "loi_khai"
          ? { ...lkData, paperConfig: lkPaper }
          : { ...hsData, paperConfig: hsPaper };

      const res = await saveDossierDocument({
        caseId,
        mode,
        tagCode: currentTagCode,
        subjectName: currentSubjectName,
        paperConfig: currentPaper,
        content: currentContent,
      });

      if (res.success) {
        setSavedNotification(true);
        setTimeout(() => setSavedNotification(false), 2500);
        // Refresh danh sách từ DB
        const updatedList = await getDossierDocuments(caseId, mode);
        if (updatedList.success && updatedList.data) {
          setDbDocuments(updatedList.data);
        }
      } else {
        alert("Lỗi lưu vào Database: " + (res.error || "Vui lòng thử lại"));
      }
    } catch (e: unknown) {
      console.error("Failed to save to Supabase:", e);
      alert("Không thể kết nối đến Database!");
    } finally {
      setIsSavingDb(false);
    }
  }, [caseId, mode, lkData, hsData, lkPaper, hsPaper]);

  // Kéo thả sắp xếp lại thứ tự hồ sơ (Đồng bộ trực tiếp canvas và DB)
  const handleReorderDocuments = useCallback(
    async (sourceIndex: number, targetIndex: number) => {
      if (
        sourceIndex === targetIndex ||
        sourceIndex < 0 ||
        sourceIndex >= dbDocuments.length ||
        targetIndex < 0 ||
        targetIndex >= dbDocuments.length
      ) {
        return;
      }

      const updatedDocs = [...dbDocuments];
      const [movedItem] = updatedDocs.splice(sourceIndex, 1);
      updatedDocs.splice(targetIndex, 0, movedItem);

      // Gán sortOrder liên tục 0, 1, 2, 3...
      const reorderedPayload = updatedDocs.map((doc, idx) => ({
        id: doc.id,
        sortOrder: idx,
        content: {
          ...(doc.content as unknown as Record<string, unknown>),
          sortOrder: idx,
        },
      }));

      // Cập nhật UI ngay lập tức để người dùng thấy animation mượt mà
      setDbDocuments(
        updatedDocs.map((doc, idx) => ({
          ...doc,
          content: {
            ...doc.content,
            sortOrder: idx,
          } as LoiKhaiData | LyLichData,
        })),
      );

      // Lưu thứ tự mới ngầm vào Supabase
      try {
        await reorderDossierDocuments(reorderedPayload);
      } catch (err) {
        console.warn("Could not persist reorder to database:", err);
      }
    },
    [dbDocuments],
  );

  // Helper cập nhật dữ liệu cho một tài liệu cụ thể trong dbDocuments (Hỗ trợ edit trực tiếp trong chế độ Matrix)
  const updateMatrixLkDocument = useCallback(
    (tagCode: string, updater: (prev: LoiKhaiData) => LoiKhaiData) => {
      setSelectedTagCode(tagCode);
      setLkData((prev) => {
        const current =
          prev.tagCode === tagCode
            ? prev
            : (dbDocuments.find((d) => d.tag_code === tagCode)
                ?.content as LoiKhaiData) || EMPTY_LK;
        return updater(current);
      });
      setDbDocuments((prevDocs) =>
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
    [dbDocuments],
  );

  const updateMatrixHsDocument = useCallback(
    (tagCode: string, updater: (prev: LyLichData) => LyLichData) => {
      if (hsData.tagCode === tagCode) {
        setHsData(updater);
      }
      setDbDocuments((prevDocs) =>
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
    [hsData.tagCode],
  );

  // Canvas viewport container ref
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

  // Vector Zoom & Wheel Listener:
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

  // Zoom button helpers
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

  // Nút 1:1 Tỉ lệ kích thước thực ngoài đời (1 cm trên màn hình = 1 cm ngoài đời thực)
  // Trong chuẩn CSS Web: 1 inch = 96px, 1cm = 37.795px.
  // Màn hình laptop FHD / desktop có PPI thực tế từ 96 đến ~141 PPI tuỳ theo mật độ điểm ảnh.
  // window.devicePixelRatio (DPR) phản ánh hệ số scaling hiển thị của OS (Windows 125%, 150%...)
  // Khi người dùng bấm 1:1, chúng ta kích hoạt tỉ lệ 1:1 vật lý tối ưu (scale = 1.0 trên màn 96 DPI, hoặc tự bù theo DPR).
  const handleSetPhysicalScale = useCallback(() => {
    // Tỉ lệ scale thực tế:
    // Nếu màn hình có DPR > 1 (ví dụ Windows scale 125% hoặc Retina), CSS pixel được phóng đại nên scale = 1 / dpr giúp kích thước vật lý chính xác,
    // hoặc với màn hình tiêu chuẩn 96 DPI thì scale = 1.0.
    // Chúng ta đặt chuẩn scale = 1.0 (chuẩn CSS 96 DPI 1:1 tuyệt đối).
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
  };

  // Ước tính số trang LK cho sidebar đồng bộ với thuật toán weighted pagination
  const estimatedLkPages = useMemo(() => {
    const qaList = lkData.qaList || [];
    if (qaList.length === 0) return 1;

    const isA4 = paperSize === "A4";
    const isPortrait = paperOrientation === "portrait";
    const maxWeightP1 = isA4
      ? isPortrait
        ? 680
        : 380
      : isPortrait
        ? 420
        : 250;
    const maxWeightNext = isA4
      ? isPortrait
        ? 890
        : 540
      : isPortrait
        ? 580
        : 350;
    const charsPerLine = isA4 ? (isPortrait ? 78 : 110) : isPortrait ? 52 : 78;
    const lineHeightPx = isA4 ? (isPortrait ? 20 : 18) : isPortrait ? 17 : 15;

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
  }, [lkData.qaList, paperSize, paperOrientation]);

  // Hàm cuộn/pan mượt mà để focus chính xác vào tài liệu được chọn
  const focusOnDossier = useCallback((tagCode: string) => {
    // Đợi 1 frame để DOM cập nhật nếu cần
    requestAnimationFrame(() => {
      const container = canvasContainerRef.current;
      const el = document.getElementById(`doc-sheet-${tagCode}`);
      if (!container || !el) return;

      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      // Tọa độ hiện tại của phần tử trên canvas không phụ thuộc zoom/pan
      // elRect.left = containerRect.left + pan.x + elementLocalX * zoom
      // Do đó: elementLocalX = (elRect.left - containerRect.left - pan.x) / zoom
      const currentZoom = zoomScaleRef.current;
      const currentPan = panRef.current;

      const elementLocalX =
        (elRect.left - containerRect.left - currentPan.x) / currentZoom;
      const elementWidth = elRect.width / currentZoom;

      // Mục tiêu: Canh giữa tài liệu vào giữa khung nhìn (hoặc cách lề trái 80px để thoáng)
      // containerWidth/2 = targetPan.x + (elementLocalX + elementWidth/2) * zoom
      const targetPanX = Math.round(
        containerRect.width / 2 -
          (elementLocalX + elementWidth / 2) * currentZoom,
      );
      const targetPanY = 40; // Cố định lề trên cho dễ đọc

      const newPan = { x: targetPanX, y: targetPanY };
      panRef.current = newPan;
      setPan(newPan);
    });
  }, []);

  // Chọn hồ sơ từ sidebar
  const handleSelectDossier = (selectedTag: string) => {
    setSelectedTagCode(selectedTag);
    const target = dbDocuments.find((d) => d.tag_code === selectedTag);
    if (target) {
      if (mode === "loi_khai") {
        setLkData(target.content as LoiKhaiData);
      } else {
        setHsData(target.content as LyLichData);
      }
    }
    // Tự động focus mượt mà tới hồ sơ được chọn
    focusOnDossier(selectedTag);
  };

  // Tạo văn bản mới để nhập liệu
  const handleCreateNewDocument = () => {
    const existingCodes = dbDocuments.map((d) => d.tag_code);
    let newTag = mode === "loi_khai" ? "LK-NEW" : "HS-NEW";
    let counter = 1;
    while (existingCodes.includes(newTag)) {
      newTag = `${mode === "loi_khai" ? "LK" : "HS"}-${String(counter).padStart(2, "0")}`;
      counter++;
    }

    const defaultPaper = mode === "loi_khai" ? lkPaper : hsPaper;

    if (mode === "loi_khai") {
      const newLk: LoiKhaiData = {
        ...EMPTY_LK,
        tagCode: newTag,
        docTitle: "BIÊN BẢN GHI LỜI KHAI",
        subjectName: "Người khai mới",
        caseSubtitle: "V/v: Vụ án điều tra",
        recordLead:
          "Hồi ... giờ ... ngày ... tháng ... năm ..., tại Công an quận ...",
        investigatorText: "Cán bộ thụ lý hồ sơ",
        reasonText: "Lấy lời khai phục vụ công tác điều tra",
        relationText: "Nhân chứng / Người liên quan",
        qaList: [
          {
            id: "qa-1",
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
        paper_config: defaultPaper,
        content: newLk,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDbDocuments((prev) => [...prev, newDocItem]);
      setSelectedTagCode(newTag);
      setLkData(newLk);
    } else {
      const newHs: LyLichData = {
        ...EMPTY_HS,
        tagCode: newTag,
        fullName: "Đối tượng mới",
        signingCity: "TP. HỒ CHÍ MINH",
        signingDay: String(new Date().getDate()).padStart(2, "0"),
        signingMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
        signingYear: String(new Date().getFullYear()),
        investigatorRankAndName: "Đại úy Nguyễn Văn A",
      };
      const newDocItem: DbDossierDocument = {
        id: `temp-${Date.now()}`,
        case_id: caseId,
        mode: "ly_lich",
        tag_code: newTag,
        subject_name: newHs.fullName,
        paper_config: defaultPaper,
        content: newHs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDbDocuments((prev) => [...prev, newDocItem]);
      setSelectedTagCode(newTag);
      setHsData(newHs);
    }

    setTimeout(() => {
      focusOnDossier(newTag);
    }, 100);
  };

  return (
    <div className="h-full w-full bg-[#0a0a0d] text-zinc-100 flex flex-col overflow-hidden font-sans antialiased selection:bg-amber-500/30">
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
            padding: ${paperSize === "A4" ? "18mm 20mm" : "12mm 12mm"} !important;
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
            padding: ${paperSize === "A4" ? "8mm 8mm" : "5mm 5mm"} !important;
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
            size: ${paperSize} ${paperOrientation};
            margin: 0mm;
          }
        }
      `}</style>

      {/* Header Controller */}
      <DossierStudioHeader
        caseId={caseId}
        setCaseId={setCaseId}
        initialCases={initialCases}
        mode={mode}
        setMode={setMode}
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
        {/* Center Workspace: Infinite Vector Canvas */}
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
            className="absolute top-0 left-0 min-w-fit min-h-fit p-10 flex justify-start select-text"
          >
            {/* TRẢI TOÀN BỘ HỒ SƠ THEO CHIỀU NGANG */}
            <div className="flex flex-row items-start gap-12">
              {mode === "loi_khai"
                ? dbDocuments.map((docItem) => {
                    const isSelected = selectedTagCode === docItem.tag_code;
                    const docData =
                      (docItem.content as LoiKhaiData) || EMPTY_LK;
                    // Khổ giấy của Lời Khai luôn đồng bộ thống nhất toàn bộ danh sách
                    const docPaper = lkPaper;

                    return (
                      <DossierLoiKhaiSheet
                        key={docItem.id}
                        docItem={docItem}
                        docData={docData}
                        docPaper={docPaper}
                        isSelected={isSelected}
                        highlightEditable={highlightEditable}
                        onSelect={() => {
                          setSelectedTagCode(docItem.tag_code);
                          setLkData(docItem.content as LoiKhaiData);
                        }}
                        onUpdateDoc={updateMatrixLkDocument}
                      />
                    );
                  })
                : dbDocuments.map((docItem) => {
                    const isSelected = selectedTagCode === docItem.tag_code;
                    const docData = (
                      isSelected ? hsData : docItem.content
                    ) as LyLichData;
                    // Khổ giấy của Lý Lịch luôn đồng bộ thống nhất toàn bộ danh sách
                    const docPaper = hsPaper;

                    return (
                      <DossierLyLichSheet
                        key={docItem.id}
                        docItem={docItem}
                        docData={docData}
                        docPaper={docPaper}
                        isSelected={isSelected}
                        highlightEditable={highlightEditable}
                        showSeal={showSeal}
                        sealAngle={sealAngle}
                        onSelect={() => {
                          setSelectedTagCode(docItem.tag_code);
                          setHsData(docItem.content as LyLichData);
                        }}
                        onUpdateDoc={updateMatrixHsDocument}
                      />
                    );
                  })}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <DossierStudioSidebar
          mode={mode}
          paperSize={paperSize}
          paperOrientation={paperOrientation}
          setPaperSize={setPaperSize}
          setPaperOrientation={setPaperOrientation}
          dbDocuments={dbDocuments}
          selectedTagCode={selectedTagCode}
          onSelectDossier={handleSelectDossier}
          onCreateNewDocument={handleCreateNewDocument}
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
    </div>
  );
}
