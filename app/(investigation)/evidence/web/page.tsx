"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  ImageIcon,
  Volume2,
  VolumeX,
  Box,
  X,
  Home,
  ChevronLeft,
  GripVertical,
  Eye,
  Layers,
  FolderOpen,
  Search,
  PenLine,
  Target,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { PDFViewerModal } from "@/components/investigation/pdf-viewer-modal";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";
import { useRoomSync } from "@/components/investigation/room-sync-context";

import type {
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
  CombinedItem,
} from "@/components/investigation/evidence/evidence-types";
import { useCaseEvidence } from "@/lib/hooks/use-case-evidence";
import {
  PhaseUnlockedModal,
  type UnlockedModalData,
} from "@/components/investigation/evidence/phase-unlocked-modal";
import { CanvasInvestigationWorkspace } from "@/components/investigation/evidence/workspaces/canvas-investigation-workspace";
import { SingleInvestigationWorkspace } from "@/components/investigation/evidence/workspaces/single-investigation-workspace";
import { MobileInvestigationWorkspace } from "@/components/investigation/evidence/workspaces/mobile-investigation-workspace";
import { GameDesktopHeader } from "@/components/investigation/evidence/game-desktop-header";
import { DossierTray } from "@/components/investigation/evidence/dossier-tray";
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import { IndictmentModal } from "@/components/investigation/board/indictment-modal";
import { JumpscareEndgame } from "@/components/investigation/jumpscare-endgame";
import { QuickActionFab } from "@/components/investigation/evidence/quick-action-fab";
import { PhoneModal } from "@/components/investigation/evidence/phone-modal";
import { PhoneSimulator } from "@/components/phone-engine/phone-simulator";
import nextDynamic from "next/dynamic";
import { HintModal } from "@/components/investigation/hint-modal";
import { DetectiveNotebookModal } from "@/components/investigation/detective-notebook-modal";
import { MainInvestigationCanvas } from "@/components/investigation/board/main-investigation-canvas";
import { useDossierDocuments } from "@/lib/hooks/use-dossier-documents";
import { getDossierSlot, useCaseDossiers } from "@/lib/hooks/use-case-dossiers";
import {
  getUnlockedDossiers,
  getUnlockedPhase,
  isDossierSlotOpen,
  normalizeDossierRef,
} from "@/lib/progress/case-progress";
import { normalizeImageUrl } from "@/lib/utils";
import {
  getStorageItem,
  setStorageItem,
  clearInvestigationStorage,
  getStorageJson,
} from "@/lib/storage";
import { caseStorageKey, normalizeCaseId, clearCaseProgress } from "@/lib/cases/case-id";
import { useInvestigationEvent } from "@/lib/investigation-events";
// Modal khám xét hiện trường kéo theo three.js (Scene360Viewer) — chỉ tải khi cần.
const ReinvestigationModal = nextDynamic(
  () =>
    import("@/components/investigation/evidence/reinvestigation-modal").then(
      (m) => m.ReinvestigationModal,
    ),
  { ssr: false },
);

type ActiveModal =
  | "phone"
  | "reinvestigate"
  | "indictment"
  | "epilogue"
  | "hint"
  | "mobile_pdf"
  | "notebook"
  | null;

function WebEvidencePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCaseId =
    searchParams.get("case_id") || searchParams.get("caseId") || "case_000";
  const caseId = normalizeCaseId(rawCaseId);
  const normalizedSheetCaseId = useMemo(
    () => normalizeCaseId(caseId),
    [caseId],
  );

  // Single modal registry
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isJumpscareActive, setIsJumpscareActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(detectiveAudio.isMuted);

  // Unlocked phase tracking (read from storage / boardgame progress)
  // Tiến độ mở bộ hồ sơ (lib/progress/case-progress.ts); phase suy ra từ đây.
  const [unlockedDossierRefs, setUnlockedDossierRefs] = useState<string[]>([]);
  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false);
  const [unlockedModalData, setUnlockedModalData] =
    useState<UnlockedModalData | null>(null);

  // Right column selection state (tự chọn mục đầu tiên khi khay hồ sơ nạp xong)
  const [selectedView, setSelectedView] = useState<SelectedView | null>(null);

  // Category filter: 'pdf' | 'evidence' (tách riêng hồ sơ và vật chứng)
  const [filterTab, setFilterTab] = useState<"pdf" | "evidence">("pdf");
  const [mobileTab, setMobileTab] = useState<"board" | "dossier">("board");

  // Nạp toàn bộ hồ sơ từ Dossier Studio (nguồn tài liệu chính)
  const { documents: dossierDocs } = useDossierDocuments(caseId);

  // Nạp danh mục các bộ hồ sơ từ bảng case_dossiers theo đồ thị vụ án (C1)
  const { dossiers, dossierOf, getPhaseForCode } = useCaseDossiers(caseId);

  const refreshDossierProgress = useCallback(() => {
    setUnlockedDossierRefs(getUnlockedDossiers(caseId));
    setIsIndictmentSolved(
      getStorageItem(caseStorageKey(caseId, "indictment_solved")) === "true",
    );
  }, [caseId]);
  useEffect(() => {
    refreshDossierProgress();
  }, [refreshDossierProgress]);
  useInvestigationEvent("DOSSIER_UNLOCKED", refreshDossierProgress);
  useInvestigationEvent("REFRESH_CANVAS_STATE", refreshDossierProgress);

  // Phase cao nhất đã mở = slot lớn nhất trong các bộ hồ sơ đang mở.
  const unlockedPhase = useMemo(
    () =>
      getUnlockedPhase(
        dossiers.map((dossier, idx) => ({
          dossier,
          slot: getDossierSlot(dossier, idx),
        })),
        unlockedDossierRefs,
        isIndictmentSolved,
      ),
    [dossiers, unlockedDossierRefs, isIndictmentSolved],
  );

  // Nạp danh mục chứng cứ & PDF per-case từ Supabase (M1 / WT-2 / WT-6)
  const {
    pdfs: casePdfs,
    evidence: caseEvs,
    rawEvidence: sheetEvidences,
    loading: isLoadingSheet,
  } = useCaseEvidence(caseId);

  // 3-Zone Layout State (Desktop):
  // Cột 1 (Trái): Khay hồ sơ & vật chứng (Dossier Tray) - width cố định/resizable (240px -> 450px)
  // Cột 2 (Giữa): Bảng điều tra (Investigation Canvas) - flex-1 (chiếm trọn không gian trung tâm)
  // Cột 3 (Phải): Trình duyệt chi tiết PDF / Vật chứng / Phone (Viewer Inspector) - width cố định/resizable (320px -> 750px)
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);
  const [isViewerExpanded, setIsViewerExpanded] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"single" | "canvas">("single");

  // Đọc preference chế độ xem tài liệu từ localStorage sau khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dect_evidence_view_mode");
      if (saved === "canvas" || saved === "single") {
        setViewMode(saved);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSetViewMode = useCallback((mode: "single" | "canvas") => {
    setViewMode(mode);
    try {
      localStorage.setItem("dect_evidence_view_mode", mode);
    } catch {
      // Ignore
    }
  }, []);
  const [isReinvestigationExpanded, setIsReinvestigationExpanded] =
    useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const dossierWidth = 320;
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Phase filter: 'all' | string | number
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<
    "all" | string | number
  >("all");

  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [activeHintCheckpointId, setActiveHintCheckpointId] = useState<
    string | undefined
  >(undefined);
  const [activeHintCategory, setActiveHintCategory] = useState<
    "motive" | "contradiction" | undefined
  >(undefined);

  const { activePing, broadcastPing, roomCode } = useRoomSync();

  // Event bus listeners
  useInvestigationEvent("OPEN_BOARD", () => setIsBoardOpen(true));
  useInvestigationEvent("TOGGLE_BOARD", () => setIsBoardOpen((prev) => !prev));
  useInvestigationEvent("OPEN_INDICTMENT", () => setActiveModal("indictment"));
  useInvestigationEvent("OPEN_EPILOGUE", () => setActiveModal("epilogue"));
  useInvestigationEvent("OPEN_PHONE", () => setActiveModal("phone"));
  useInvestigationEvent("OPEN_NOTEBOOK", () => setActiveModal("notebook"));
  useInvestigationEvent("OPEN_CANVAS_THEME", () => {
    if (viewMode !== "canvas") {
      handleSetViewMode("canvas");
    }
  });
  useInvestigationEvent("OPEN_HINT", (e: any) => {
    const cpId =
      e?.detail?.checkpointId ||
      (typeof e?.detail === "string" ? e.detail : undefined);
    const cat =
      e?.detail?.category ||
      (typeof e?.detail === "object" ? e.detail?.category : undefined);
    setActiveHintCheckpointId(cpId);
    setActiveHintCategory(cat);
    setActiveModal("hint");
  });

  // Hợp nhất dữ liệu: Dossier Studio (nguồn chính) + 1 PDF test + Vật chứng / Ảnh từ Live Sheet
  const effectiveItems = useMemo(() => {
    // 1. Chuyển đổi toàn bộ hồ sơ từ Dossier Studio thành PDF/Dossier Items
    const dossierItems: CombinedItem[] = (dossierDocs || []).map((doc, idx) => {
      const code = (doc.tag_code || "").trim();
      const dInfo = dossierOf(code);
      const phase = dInfo ? dInfo.slotIndex : getPhaseForCode(code);

      const rawContent: any = doc.content || {};
      const title =
        doc.mode === "ly_lich"
          ? doc.subject_name
            ? `Lý lịch: ${doc.subject_name}`
            : rawContent.fullName
              ? `Lý lịch: ${rawContent.fullName}`
              : `Lý lịch #${code}`
          : rawContent.docTitle ||
            (doc.subject_name
              ? `Lời khai: ${doc.subject_name}`
              : `Lời khai #${code}`);

      const sortOrder =
        typeof rawContent.sortOrder === "number"
          ? rawContent.sortOrder
          : idx * 10;

      return {
        type: "pdf",
        phase,
        order: sortOrder,
        dossierKey: dInfo?.key,
        dossierTitle: dInfo?.title,
        data: {
          id: `dossier-${doc.id}`,
          code,
          title,
          url: "", // Sẽ render qua DiegeticDossierSheet
          phase,
          order: sortOrder,
          dossierKey: dInfo?.key,
          dossierTitle: dInfo?.title,
        },
      };
    });

    // 2. Bổ sung các tài liệu giấy thuộc bộ hồ sơ chính (như A-01, A-04, A-05 trong Ban Đầu), loại bỏ trùng lặp và các mã rác/stub
    const dossierCodes = new Set(
      (dossierDocs || []).map((d) => (d.tag_code || "").trim().toUpperCase()),
    );
    const validAdditionalPdfs: CombinedItem[] = casePdfs
      .filter((doc) => {
        const c = (doc.code || "").trim().toUpperCase();
        // Không nhận mã đã có trong Dossier Studio (tránh trùng A-15, A-17, A-20)
        if (dossierCodes.has(c)) return false;
        // Chỉ nhận các tài liệu thực sự thuộc bộ hồ sơ vụ án đã đăng ký trong case_dossiers
        const dInfo = dossierOf(doc.code);
        return Boolean(dInfo);
      })
      .map((doc) => {
        const dInfo = dossierOf(doc.code);
        const phase = dInfo ? dInfo.slotIndex : doc.phase;
        return {
          type: "pdf" as const,
          data: {
            ...doc,
            url: "", // Giấy tờ điều tra: luôn preview dạng giấy diegetic, không mở PDF gốc
            dossierKey: dInfo?.key || doc.dossierKey,
            dossierTitle: dInfo?.title || doc.dossierTitle,
          },
          phase,
          order: doc.order,
          dossierKey: dInfo?.key || doc.dossierKey,
          dossierTitle: dInfo?.title || doc.dossierTitle,
        };
      });

    // 3. Vật chứng ảnh từ Sheet hoặc Supabase
    let photoItems: CombinedItem[] = [];
    if (sheetEvidences && sheetEvidences.length > 0) {
      const validRows = sheetEvidences.filter((row: any) => {
        const c = String(row.code || "").trim();
        return c && !c.startsWith("avatar_") && c !== "crime_scene";
      });

      photoItems = validRows
        .filter((row: any) => {
          const code = String(row.code || "").trim().toUpperCase();
          if (dossierCodes.has(code)) return false;

          const title = String(row.label || row.title || "").toLowerCase();
          if (
            title.includes("lời khai") ||
            title.includes("lý lịch") ||
            title.includes("trích lục") ||
            title.includes("biên bản lấy lời khai")
          ) {
            return false;
          }

          const cat = String(row.category || "").toUpperCase();
          return (
            title.includes("ảnh") ||
            cat === "FORENSIC" ||
            cat === "SCENE" ||
            title.includes("lược") ||
            title.includes("hoa xoan") ||
            title.includes("bùa yêu") ||
            row.kind === "photo" ||
            row.kind === "pdf"
          );
        })
        .map((row: any, idx: number): CombinedItem => {
          const code = String(row.code || "").trim();
          const title = String(
            row.label || row.title || `Vật chứng #${code}`,
          ).trim();
          const driveUrl = String(row.drive_url || "").trim();

          // Ánh xạ Phase / Bộ hồ sơ theo case_dossiers (C1)
          const dInfo = dossierOf(code);
          const phase = dInfo ? dInfo.slotIndex : getPhaseForCode(code);

          const localFallback = caseEvs.find(
            (e) =>
              e.title.toLowerCase().includes(title.toLowerCase()) ||
              title.toLowerCase().includes(e.title.toLowerCase()),
          );
          const imgUrl =
            driveUrl || localFallback?.thumbnail || "/photo_scene_overview.jpg";

          return {
            type: "evidence",
            phase,
            order: idx * 10,
            dossierKey: dInfo?.key,
            dossierTitle: dInfo?.title,
            data: {
              id: `sheet-${code}`,
              caseId,
              kind: "photo",
              title,
              preview: String(row.description || title),
              code,
              thumbnail: imgUrl,
              timestamp: "24/07/2016",
              phase,
              order: idx * 10,
              dossierKey: dInfo?.key,
              dossierTitle: dInfo?.title,
            },
          };
        });
    } else if (caseEvs && caseEvs.length > 0) {
      photoItems = caseEvs
        .filter((item) => {
          const code = String(item.code || "").trim().toUpperCase();
          if (!code || code.startsWith("AVATAR_") || code === "CRIME_SCENE") {
            return false;
          }
          if (dossierCodes.has(code)) return false;
          const title = String(item.title || "").toLowerCase();
          if (
            title.includes("lời khai") ||
            title.includes("lý lịch") ||
            title.includes("trích lục") ||
            title.includes("biên bản lấy lời khai")
          ) {
            return false;
          }
          return true;
        })
        .map((item): CombinedItem => {
        const dInfo = dossierOf(item.code);
        const phase = dInfo ? dInfo.slotIndex : item.phase;
        return {
          type: "evidence",
          data: {
            ...item,
            dossierKey: dInfo?.key || item.dossierKey,
            dossierTitle: dInfo?.title || item.dossierTitle,
          },
          phase,
          order: item.order,
          dossierKey: dInfo?.key || item.dossierKey,
          dossierTitle: dInfo?.title || item.dossierTitle,
        };
      });
    }

    return [...validAdditionalPdfs, ...dossierItems, ...photoItems];
  }, [
    dossierDocs,
    sheetEvidences,
    caseId,
    getPhaseForCode,
    dossierOf,
    casePdfs,
    caseEvs,
  ]);

  // Tự động nhảy đến vị trí tài liệu/vật chứng khi có đồng đội chỉ điểm (Ping)
  useEffect(() => {
    if (!activePing) return;
    if (
      activePing.targetType === "doc" ||
      activePing.targetType === "evidence"
    ) {
      // Tìm tài liệu tương ứng trong danh sách effectiveItems
      const targetItem = (effectiveItems as CombinedItem[]).find(
        (i) =>
          i.data.id === activePing.targetId ||
          (i.data as any).code === activePing.targetId,
      );

      if (targetItem) {
        // Tự động mở tab phân loại phù hợp (Hồ sơ hay Vật chứng)
        if (targetItem.type === "evidence") {
          setFilterTab("evidence");
          setSelectedView({
            type: "evidence",
            data: targetItem.data as PhysicalEvidence,
          });
        } else {
          setFilterTab("pdf");
          setSelectedView({
            type: "pdf",
            data: targetItem.data as PDFDocument,
          });
        }

        // Tự chuyển tab trên mobile nếu đang ở tab bảng
        setMobileTab("dossier");

        // Bỏ thu nhỏ khay tài liệu nếu đang bị thu nhỏ
        setIsDossierCollapsed(false);

        // Cuộn thẻ tài liệu vào tầm nhìn nếu có trong DOM
        if (typeof document !== "undefined") {
          setTimeout(() => {
            const el = document.getElementById(
              `doc-card-${targetItem.data.id}`,
            );
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 150);
        }
      }
    }
  }, [activePing, effectiveItems]);

  useEffect(() => {
    setStorageItem("play_experience", "web");

    const isIntroSeen =
      getStorageItem(caseStorageKey(caseId, "intro_seen")) === "true" ||
      (caseId === "case_000" && getStorageItem("intro_seen") === "true");
    if (!isIntroSeen) {
      const sorted = [...dossiers].sort((a, b) => {
        const slotA =
          typeof (a as any).slot_index === "number" ? (a as any).slot_index : 0;
        const slotB =
          typeof (b as any).slot_index === "number" ? (b as any).slot_index : 0;
        return slotA - slotB;
      });
      const firstDossier = sorted[0];
      const firstKey = firstDossier?.dossier_key;
      const firstSlot =
        typeof (firstDossier as any)?.slot_index === "number"
          ? (firstDossier as any).slot_index
          : 0;

      const isInitialItem = (item: CombinedItem) => {
        if (item.phase === 0) return true;
        if (firstKey && item.dossierKey === firstKey) return true;
        if (firstDossier && item.phase === firstSlot) return true;
        return false;
      };

      const initPdfs = (effectiveItems as CombinedItem[])
        .filter((i) => i.type === "pdf" && isInitialItem(i))
        .map((i) => i.data as PDFDocument);
      const initEvidence = (effectiveItems as CombinedItem[])
        .filter((i) => i.type === "evidence" && isInitialItem(i))
        .map((i) => i.data as PhysicalEvidence);

      if (initPdfs.length > 0 || initEvidence.length > 0) {
        setUnlockedModalData({
          unlockedPhase: firstSlot,
          newPdfs: initPdfs,
          newEvidence: initEvidence,
        });
      } else {
        const fallbackPdfs = casePdfs.filter(
          (d) =>
            d.phase === 0 ||
            (firstKey && d.dossierKey === firstKey) ||
            d.phase === firstSlot,
        );
        const fallbackEvs = caseEvs.filter(
          (e) =>
            e.phase === 0 ||
            (firstKey && e.dossierKey === firstKey) ||
            e.phase === firstSlot,
        );
        if (fallbackPdfs.length > 0 || fallbackEvs.length > 0) {
          setUnlockedModalData({
            unlockedPhase: firstSlot,
            newPdfs: fallbackPdfs,
            newEvidence: fallbackEvs,
          });
        }
      }
    }

    const savedCollapsed = getStorageItem("web_dossier_collapsed");
    if (savedCollapsed === "true") {
      setIsDossierCollapsed(true);
    }
  }, [caseId, effectiveItems, dossiers, casePdfs, caseEvs]);



  const toggleDossierCollapse = useCallback(() => {
    detectiveAudio.playPaperRustle();
    setIsDossierCollapsed((prev) => {
      const next = !prev;
      setStorageItem("web_dossier_collapsed", next ? "true" : "false");
      return next;
    });
  }, []);

  const isPhaseUnlocked = useCallback(
    (phase: number) => {
      if (phase === 0) return true;
      return phase <= unlockedPhase;
    },
    [unlockedPhase],
  );

  const isDossierUnlocked = useCallback(
    (key: string): boolean => {
      if (!key || key === "all" || key === "evidence" || key === "unassigned") {
        return true;
      }
      const idx = dossiers.findIndex(
        (d) =>
          (d.dossier_key || "").toLowerCase().trim() ===
          key.toLowerCase().trim(),
      );
      if (idx < 0) {
        return (
          isIndictmentSolved ||
          unlockedDossierRefs.includes(normalizeDossierRef(key))
        );
      }
      return isDossierSlotOpen(
        dossiers[idx],
        getDossierSlot(dossiers[idx], idx),
        unlockedDossierRefs,
        isIndictmentSolved,
      );
    },
    [dossiers, unlockedDossierRefs, isIndictmentSolved],
  );

  // Tự động chọn tài liệu đầu tiên khi nạp xong dữ liệu nếu chưa có mục nào được chọn
  useEffect(() => {
    if (!selectedView && effectiveItems.length > 0) {
      const firstUnlockedPdf = effectiveItems.find(
        (item) => item.type === "pdf" && isDossierUnlocked(item.dossierKey || "")
      );
      if (firstUnlockedPdf) {
        setSelectedView({ type: "pdf", data: firstUnlockedPdf.data as PDFDocument });
      } else {
        const firstItem = effectiveItems[0];
        if (firstItem.type === "pdf") {
          setSelectedView({ type: "pdf", data: firstItem.data as PDFDocument });
        } else {
          setSelectedView({ type: "evidence", data: firstItem.data as PhysicalEvidence });
        }
      }
    }
  }, [effectiveItems, isDossierUnlocked, selectedView]);

  const handleSelectPdf = (doc: PDFDocument) => {
    if (!isPhaseUnlocked(doc.phase)) return;
    setSelectedView({ type: "pdf", data: doc });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveModal("mobile_pdf");
    } else if (activeModal === "phone") {
      setActiveModal(null);
    }
  };

  const handleSelectEvidence = (item: PhysicalEvidence) => {
    if (!isPhaseUnlocked(item.phase)) return;
    setSelectedView({ type: "evidence", data: item });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveModal("mobile_pdf");
    } else if (activeModal === "phone") {
      setActiveModal(null);
    }
  };

  const resetAllProgress = () => {
    clearCaseProgress(caseId);
    window.location.reload();
  };

  const pdfItems = useMemo(() => {
    return (effectiveItems as CombinedItem[])
      .filter((item: CombinedItem) => {
        if (!isPhaseUnlocked(item.phase)) return false;
        if (item.type !== "pdf") return false;
        if (selectedPhaseFilter !== "all") {
          if (typeof selectedPhaseFilter === "number") {
            if (item.phase !== selectedPhaseFilter) return false;
          } else if (selectedPhaseFilter === "evidence") {
            return false;
          } else if (selectedPhaseFilter === "unassigned") {
            if (item.dossierKey) return false;
          } else {
            if (item.dossierKey !== selectedPhaseFilter) return false;
          }
        }
        return true;
      })
      .sort((a: CombinedItem, b: CombinedItem) => a.order - b.order);
  }, [effectiveItems, isPhaseUnlocked, selectedPhaseFilter]);

  const evidenceItems = useMemo(() => {
    return (effectiveItems as CombinedItem[])
      .filter((item: CombinedItem) => {
        if (!isPhaseUnlocked(item.phase)) return false;
        if (item.type !== "evidence") return false;
        if (selectedPhaseFilter !== "all") {
          if (typeof selectedPhaseFilter === "number") {
            if (item.phase !== selectedPhaseFilter) return false;
          } else if (selectedPhaseFilter === "evidence") {
            return true;
          } else if (selectedPhaseFilter === "unassigned") {
            if (item.dossierKey) return false;
          } else {
            if (item.dossierKey !== selectedPhaseFilter) return false;
          }
        }
        return true;
      })
      .sort((a: CombinedItem, b: CombinedItem) => a.order - b.order);
  }, [effectiveItems, isPhaseUnlocked, selectedPhaseFilter]);

  // Tự động chọn tài liệu/vật chứng đầu tiên khi khay hồ sơ nạp xong hoặc chuyển tab
  useEffect(() => {
    const currentList = filterTab === "evidence" ? evidenceItems : pdfItems;
    if (currentList.length > 0) {
      setSelectedView((prev) => {
        const currentId = prev?.data?.id;
        const exists = currentList.some((item) => item.data.id === currentId);
        if (!exists) {
          const first = currentList[0];
          return { type: first.type, data: first.data as any };
        }
        return prev;
      });
    }
  }, [filterTab, pdfItems, evidenceItems]);

  return (
    <div
      suppressHydrationWarning
      className="h-full w-full bg-[#0d0a08] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex flex-col items-stretch justify-start box-border min-h-0 min-w-0 select-none"
    >
      {/* DESKTOP HEADER (CHỈ HIỂN THỊ KHI Ở CHẾ ĐỘ XEM LẺ; CHẾ ĐỘ CANVAS ĐÃ TÍCH HỢP TOÀN BỘ VÀO SIDEBAR DỌC) */}
      {!(isMounted && isMobile) && viewMode !== "canvas" && (
        <GameDesktopHeader
          viewMode={viewMode}
          onViewModeChange={handleSetViewMode}
          isBoardOpen={isBoardOpen}
          onToggleBoard={() => setIsBoardOpen((prev) => !prev)}
        />
      )}

      {/* CHỈ MOUNT DUY NHẤT 1 WORKSPACE: MOBILE HOẶC DESKTOP THEO TRẠNG THÁI isMobile SAU MOUNT */}
      {isMounted && isMobile ? (
        /* 1. MÀN HÌNH DI ĐỘNG (< LG): WORKSPACE RIÊNG BIỆT CHO MOBILE */
        <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden relative">
          <MobileInvestigationWorkspace
            caseId={caseId}
            mobileTab={mobileTab}
            onSelectBoard={() => setMobileTab("board")}
            onSelectDossierTab={(tab: "pdf" | "evidence") => {
              setMobileTab("dossier");
              setFilterTab(tab);
            }}
            filterTab={filterTab}
            onSetFilterTab={(tab) => setFilterTab(tab)}
            selectedPhaseFilter={selectedPhaseFilter}
            onSetPhaseFilter={(val) => setSelectedPhaseFilter(val)}
            pdfItems={pdfItems}
            evidenceItems={evidenceItems}
            dossiers={dossiers}
            selectedView={selectedView}
            onSelectPdf={handleSelectPdf}
            onSelectEvidence={handleSelectEvidence}
            isPhaseUnlocked={isPhaseUnlocked}
            isDossierUnlocked={isDossierUnlocked}
            activePing={activePing}
            broadcastPing={broadcastPing}
            activeModal={activeModal}
            setActiveModal={setActiveModal}
          />
        </div>
      ) : (
        /* 2. MÀN HÌNH MÁY TÍNH (>= LG): WORKSPACE RIÊNG BIỆT CHO DESKTOP (BÀN HỒ SƠ HOẶC XEM LẺ) */
        <div
          ref={workspaceRef}
          className="w-full flex-1 min-h-0 flex flex-row items-stretch justify-start overflow-hidden min-w-0 relative gap-0 p-0"
        >
        {viewMode === "canvas" ? (
          <CanvasInvestigationWorkspace
            caseId={caseId}
            filterTab={filterTab}
            onSetFilterTab={(tab) => setFilterTab(tab)}
            selectedPhaseFilter={selectedPhaseFilter}
            onSetPhaseFilter={(val) => setSelectedPhaseFilter(val)}
            pdfItems={pdfItems}
            evidenceItems={evidenceItems}
            dossierDocs={dossierDocs}
            dossiers={dossiers}
            selectedView={selectedView}
            onSelectPdf={handleSelectPdf}
            onSelectEvidence={handleSelectEvidence}
            isPhaseUnlocked={isPhaseUnlocked}
            isDossierUnlocked={isDossierUnlocked}
            activePing={activePing}
            broadcastPing={broadcastPing}
            activeModal={activeModal}
            setActiveModal={setActiveModal}
            setSelectedView={setSelectedView}
            onSwitchToSingleView={() => handleSetViewMode("single")}
          />
        ) : (
          <SingleInvestigationWorkspace
            caseId={caseId}
            filterTab={filterTab}
            onSetFilterTab={(tab) => setFilterTab(tab)}
            selectedPhaseFilter={selectedPhaseFilter}
            onSetPhaseFilter={(val) => setSelectedPhaseFilter(val)}
            pdfItems={pdfItems}
            evidenceItems={evidenceItems}
            dossiers={dossiers}
            selectedView={selectedView}
            onSelectPdf={handleSelectPdf}
            onSelectEvidence={handleSelectEvidence}
            isPhaseUnlocked={isPhaseUnlocked}
            isDossierUnlocked={isDossierUnlocked}
            activePing={activePing}
            broadcastPing={broadcastPing}
            activeModal={activeModal}
            setActiveModal={setActiveModal}
          />
        )}
      </div>
      )}

      {/* PHASE UNLOCKED CINEMATIC STORY MODAL */}
      <PhaseUnlockedModal
        caseId={caseId}
        unlockedModalData={unlockedModalData}
        playExperience="web"
        onClose={() => {
          setStorageItem(caseStorageKey(caseId, "intro_seen"), "true");
          setUnlockedModalData(null);
        }}
        onSelectPdf={handleSelectPdf}
        onSelectEvidence={handleSelectEvidence}
        onSetPhaseFilter={(phase) => setSelectedPhaseFilter(phase)}
      />

      {/* JUMPSCARE ENDGAME SEQUENCE */}
      <JumpscareEndgame
        isActive={isJumpscareActive}
        onComplete={() => {
          setIsJumpscareActive(false);
          setActiveModal("epilogue");
        }}
      />

      {/* BẢN KẾT LUẬN ĐIỀU TRA VỤ ÁN (PHÁN QUYẾT & TRẢ LỜI CÂU HỎI KẾT TỘI) */}
      <IndictmentModal
        caseId={caseId}
        isOpen={activeModal === "indictment"}
        onClose={() => setActiveModal(null)}
        onSubmitIndictment={() => {
          // Sau khi nộp đúng đáp án bản kết luận điều tra, lúc này mới hiển thị Hậu án!
          setActiveModal("epilogue");
        }}
      />

      {/* POST-CASE EPILOGUE STORIES MODAL */}
      <EpilogueModal
        caseId={caseId}
        isOpen={activeModal === "epilogue"}
        onClose={() => setActiveModal(null)}
      />

      {/* QUICK ACTION FAB MENU (CHỈ HIỂN THỊ TRÊN MOBILE, ẨN TRÊN DESKTOP) */}
      {activeModal !== "reinvestigate" && (
        <div className="lg:hidden">
          <QuickActionFab
            onOpenBoardGame={() => {
              detectiveAudio.playPaperRustle();
              router.push("/evidence/boardgame");
            }}
            onResetCase={resetAllProgress}
            onGoHome={() => router.push("/")}
          />
        </div>
      )}

      {/* HINT SYSTEM MODAL */}
      <HintModal
        caseId={caseId}
        isOpen={activeModal === "hint"}
        checkpointId={activeHintCheckpointId}
        category={activeHintCategory}
        onClose={() => {
          setActiveModal(null);
          setActiveHintCheckpointId(undefined);
          setActiveHintCategory(undefined);
        }}
      />

      {/* VICTIM PHONE SIMULATOR MODAL — MOBILE ONLY (desktop dùng inline Zone 3) */}
      <div className="lg:hidden">
        <PhoneModal
          caseId={caseId}
          isOpen={activeModal === "phone"}
          onClose={() => {
            setIsReinvestigationExpanded(false);
            setActiveModal(null);
          }}
        />
      </div>

      {/* RE-INVESTIGATION CRIME SCENE MODAL — MOBILE ONLY */}
      <div className="lg:hidden">
        <ReinvestigationModal
          caseId={caseId}
          isOpen={activeModal === "reinvestigate"}
          onClose={() => {
            setIsReinvestigationExpanded(false);
            setActiveModal(null);
          }}
        />
      </div>

      {/* DETECTIVE NOTEBOOK MODAL — Chỉ mở modal toàn cục có backdrop khi ở Single/Mobile view. Canvas view dùng Floating Notebook độc lập */}
      {viewMode !== "canvas" && (
        <DetectiveNotebookModal
          isOpen={activeModal === "notebook"}
          onClose={() => setActiveModal(null)}
          caseId={caseId}
        />
      )}

      {/* MOBILE FULL SCREEN MODAL */}
      <PDFViewerModal
        isOpen={activeModal === "mobile_pdf"}
        selectedView={selectedView}
        pdfUrl={selectedView?.type === "pdf" ? selectedView.data.url : null}
        title={selectedView?.data.title}
        caseId={caseId}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

export default function WebEvidencePage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-[#0d0a08] flex items-center justify-center text-[#d9a066] font-mono text-xs">
          Đang nạp hồ sơ vụ án...
        </div>
      }
    >
      <WebEvidencePageContent />
    </Suspense>
  );
}
