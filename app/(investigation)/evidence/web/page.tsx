"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
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
import {
  CASE_000_PDFS,
  CASE_000_EVIDENCE,
} from "@/components/investigation/evidence/evidence-data";
import {
  PhaseUnlockedModal,
  type UnlockedModalData,
} from "@/components/investigation/evidence/phase-unlocked-modal";
import { EvidenceDetailInspector } from "@/components/investigation/evidence/evidence-detail-inspector";
import { InvestigationMobileNav } from "@/components/investigation/evidence/investigation-mobile-nav";
import { DossierTray } from "@/components/investigation/evidence/dossier-tray";
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import { JumpscareEndgame } from "@/components/investigation/jumpscare-endgame";
import { QuickActionFab } from "@/components/investigation/evidence/quick-action-fab";
import { PhoneModal } from "@/components/investigation/evidence/phone-modal";
import { PhoneSimulator } from "@/components/phone-engine/phone-simulator";
import nextDynamic from "next/dynamic";
import { HintModal } from "@/components/investigation/hint-modal";
import { DetectiveNotebookModal } from "@/components/investigation/detective-notebook-modal";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { useDossierDocuments } from "@/lib/hooks/use-dossier-documents";
import { useCaseDossiers } from "@/lib/hooks/use-case-dossiers";
import { normalizeImageUrl } from "@/lib/utils";
import {
  getStorageItem,
  setStorageItem,
  clearInvestigationStorage,
  getStorageJson,
} from "@/lib/storage";
import { caseStorageKey, normalizeCaseId } from "@/lib/cases/case-id";
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
  | "epilogue"
  | "hint"
  | "mobile_pdf"
  | "notebook"
  | null;

function WebEvidencePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCaseId =
    searchParams.get("case_id") || searchParams.get("caseId") || "case-000";
  const caseId =
    rawCaseId === "case_000" || rawCaseId === "case-000"
      ? "case-000"
      : rawCaseId;
  const normalizedSheetCaseId = useMemo(
    () => normalizeCaseId(caseId),
    [caseId],
  );

  // Single modal registry
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isJumpscareActive, setIsJumpscareActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(detectiveAudio.isMuted);

  // Unlocked phase tracking (read from storage / boardgame progress)
  const [unlockedPhase, setUnlockedPhase] = useState<number>(0);
  const [unlockedModalData, setUnlockedModalData] =
    useState<UnlockedModalData | null>(null);

  // Right column selection state (Default: First PDF)
  const [selectedView, setSelectedView] = useState<SelectedView>({
    type: "pdf",
    data: CASE_000_PDFS[0],
  });

  // Category filter: 'pdf' | 'evidence' (tách riêng hồ sơ và vật chứng)
  const [filterTab, setFilterTab] = useState<"pdf" | "evidence">("pdf");
  const [mobileTab, setMobileTab] = useState<"board" | "dossier">("board");

  // Nạp dữ liệu Live CMS từ tab 'evidences' trên Google Sheets theo caseId
  const { data: sheetEvidences, loading: isLoadingSheet } = usePhoneData<any>(
    "evidences",
    normalizedSheetCaseId,
  );

  // Nạp toàn bộ hồ sơ từ Dossier Studio (nguồn tài liệu chính)
  const { documents: dossierDocs } = useDossierDocuments(caseId);

  // Nạp danh mục các bộ hồ sơ từ bảng case_dossiers theo đồ thị vụ án (C1)
  const { getPhaseForCode } = useCaseDossiers(caseId);

  // 3-Zone Layout State (Desktop):
  // Cột 1 (Trái): Khay hồ sơ & vật chứng (Dossier Tray) - width cố định/resizable (240px -> 450px)
  // Cột 2 (Giữa): Bảng điều tra (Investigation Canvas) - flex-1 (chiếm trọn không gian trung tâm)
  // Cột 3 (Phải): Trình duyệt chi tiết PDF / Vật chứng / Phone (Viewer Inspector) - width cố định/resizable (320px -> 750px)
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);
  const [isViewerExpanded, setIsViewerExpanded] = useState<boolean>(false);
  const [isReinvestigationExpanded, setIsReinvestigationExpanded] =
    useState(false);
  const [dossierWidth, setDossierWidth] = useState<number>(300);
  const [viewerWidth, setViewerWidth] = useState<number>(460);
  const [isDraggingLeftSplit, setIsDraggingLeftSplit] =
    useState<boolean>(false);
  const [isDraggingRightSplit, setIsDraggingRightSplit] =
    useState<boolean>(false);

  // Phase filter: 'all' | 0 | 1 | 2 | 3
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<
    "all" | number
  >("all");

  const [activeHintCheckpointId, setActiveHintCheckpointId] = useState<
    string | undefined
  >(undefined);
  const [activeHintCategory, setActiveHintCategory] = useState<
    "motive" | "alibi" | undefined
  >(undefined);

  const { activePing, broadcastPing, roomCode } = useRoomSync();

  // Event bus listeners
  useInvestigationEvent("OPEN_EPILOGUE", () => setActiveModal("epilogue"));
  useInvestigationEvent("OPEN_PHONE", () => setActiveModal("phone"));
  useInvestigationEvent("OPEN_NOTEBOOK", () => setActiveModal("notebook"));
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
      // Ánh xạ Phase / Bộ hồ sơ qua case_dossiers (C1), fallback tự động nếu chưa gán
      const phase = getPhaseForCode(code);

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
        data: {
          id: `dossier-${doc.id}`,
          code,
          title,
          url: "", // Sẽ render qua DiegeticDossierSheet
          phase,
          order: sortOrder,
        },
      };
    });

    // 2. Thêm file PDF kiểm thử duy nhất (Phase 0) cho case_000
    const isCase000 = caseId === "case-000" || caseId === "case_000";
    const testPdfItems: CombinedItem[] = isCase000
      ? CASE_000_PDFS.map((doc) => ({
          type: "pdf" as const,
          data: doc,
          phase: doc.phase,
          order: doc.order,
        }))
      : [];

    // 3. Vật chứng ảnh từ Sheet hoặc fallback local
    let photoItems: CombinedItem[] = [];
    if (sheetEvidences && sheetEvidences.length > 0) {
      const validRows = sheetEvidences.filter((row: any) => {
        const c = String(row.code || "").trim();
        return c && !c.startsWith("avatar_") && c !== "crime_scene";
      });

      photoItems = validRows
        .filter((row: any) => {
          const title = String(row.label || row.title || "").toLowerCase();
          const cat = String(row.category || "").toUpperCase();
          return (
            title.includes("ảnh") ||
            cat === "FORENSIC" ||
            cat === "SCENE" ||
            title.includes("lược") ||
            title.includes("hoa xoan") ||
            title.includes("bùa yêu")
          );
        })
        .map((row: any, idx: number): CombinedItem => {
          const code = String(row.code || "").trim();
          const title = String(
            row.label || row.title || `Vật chứng #${code}`,
          ).trim();
          const driveUrl = String(row.drive_url || "").trim();

          // Ánh xạ Phase / Bộ hồ sơ theo case_dossiers (C1)
          const phase = getPhaseForCode(code);

          const localFallback =
            caseId === "case-000"
              ? CASE_000_EVIDENCE.find(
                  (e) =>
                    e.title.toLowerCase().includes(title.toLowerCase()) ||
                    title.toLowerCase().includes(e.title.toLowerCase()),
                )
              : undefined;
          const imgUrl =
            driveUrl || localFallback?.thumbnail || "/photo_scene_overview.jpg";

          return {
            type: "evidence",
            phase,
            order: idx * 10,
            data: {
              id: `sheet-${code}`,
              caseId,
              kind: "photo",
              title,
              preview: String(row.description || title),
              evidenceId: code,
              thumbnail: imgUrl,
              timestamp: "24/07/2016",
              recoveredBy: "ĐIỀU TRA VIÊN",
              integrityStatus: "secured",
              chainOfCustody: "VERIFIED",
              phase,
              order: idx * 10,
            },
          };
        });
    } else if (caseId === "case-000") {
      photoItems = CASE_000_EVIDENCE.map((item): CombinedItem => ({
        type: "evidence",
        data: item,
        phase: item.phase,
        order: item.order,
      }));
    }

    return [...testPdfItems, ...dossierItems, ...photoItems];
  }, [dossierDocs, sheetEvidences, caseId, getPhaseForCode]);

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

    const isIntroSeen = getStorageItem(caseStorageKey(caseId, "intro_seen"));
    if (isIntroSeen !== "true") {
      const initPdfs = (effectiveItems as CombinedItem[])
        .filter((i) => i.type === "pdf" && i.phase === 0)
        .map((i) => i.data as PDFDocument);
      const initEvidence = (effectiveItems as CombinedItem[])
        .filter((i) => i.type === "evidence" && i.phase === 0)
        .map((i) => i.data as PhysicalEvidence);

      if (initPdfs.length > 0 || initEvidence.length > 0) {
        setUnlockedModalData({
          unlockedPhase: 0,
          newPdfs: initPdfs,
          newEvidence: initEvidence,
        });
      } else if (caseId === "case-000") {
        setUnlockedModalData({
          unlockedPhase: 0,
          newPdfs: CASE_000_PDFS.filter((d) => d.phase === 0),
          newEvidence: CASE_000_EVIDENCE.filter((e) => e.phase === 0),
        });
      }
    }

    // Check current unlocked phase from boardgame progress & graph unlocks (C1)
    const solvedFollowups = getStorageJson<string[]>(
      caseStorageKey(caseId, "solved_followups"),
      [],
    );
    const isReinvestigateUnlocked =
      getStorageItem(caseStorageKey(caseId, "reinvestigate_unlocked")) ===
      "true";
    const isIndictmentSolved =
      getStorageItem(caseStorageKey(caseId, "indictment_solved")) === "true";
    const unlockedDossiers = getStorageJson<string[]>(
      caseStorageKey(caseId, "unlocked_dossiers"),
      [],
    );

    if (
      isIndictmentSolved ||
      unlockedDossiers.includes("ket_luan") ||
      unlockedDossiers.includes("phase_4")
    ) {
      setUnlockedPhase(3);
    } else if (
      isReinvestigateUnlocked ||
      solvedFollowups.length >= 2 ||
      unlockedDossiers.includes("bo_b") ||
      unlockedDossiers.includes("bo_c") ||
      unlockedDossiers.includes("phase_2") ||
      unlockedDossiers.includes("phase_3")
    ) {
      setUnlockedPhase(2);
    } else {
      setUnlockedPhase(1);
    }

    // Khôi phục layout preference từ storage
    const savedDossierWidth = getStorageItem("web_dossier_width");
    if (savedDossierWidth) {
      const parsedW = parseFloat(savedDossierWidth);
      if (!isNaN(parsedW) && parsedW >= 220 && parsedW <= 460) {
        setDossierWidth(parsedW);
      } else {
        setDossierWidth(300);
      }
    } else {
      setDossierWidth(300);
    }
    const savedViewerWidth = getStorageItem("web_viewer_width");
    if (savedViewerWidth) {
      const parsedV = parseFloat(savedViewerWidth);
      if (!isNaN(parsedV) && parsedV >= 320 && parsedV <= 750) {
        setViewerWidth(parsedV);
      } else {
        setViewerWidth(460);
      }
    } else {
      setViewerWidth(460);
    }
    const savedCollapsed = getStorageItem("web_dossier_collapsed");
    if (savedCollapsed === "true") {
      setIsDossierCollapsed(true);
    }
  }, [caseId, effectiveItems]);

  // Xử lý kéo thả điều chỉnh độ rộng Khay tài liệu (Cột 1 bên trái)
  useEffect(() => {
    if (!isDraggingLeftSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const windowWidth = window.innerWidth;
      const maxLeft = Math.min(460, windowWidth - viewerWidth - 360);
      const clamped = Math.min(
        Math.max(e.clientX, 220),
        Math.max(220, maxLeft),
      );
      setDossierWidth(clamped);
    };

    const handleMouseUp = () => {
      setIsDraggingLeftSplit(false);
      setStorageItem("web_dossier_width", dossierWidth.toString());
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeftSplit, dossierWidth, viewerWidth]);

  // Xử lý kéo thả điều chỉnh độ rộng Trình duyệt chi tiết (Cột 3 bên phải)
  useEffect(() => {
    if (!isDraggingRightSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const windowWidth = window.innerWidth;
      const newViewerWidth = windowWidth - e.clientX;
      const maxRight = Math.min(750, windowWidth - dossierWidth - 360);
      const clamped = Math.min(
        Math.max(newViewerWidth, 320),
        Math.max(320, maxRight),
      );
      setViewerWidth(clamped);
    };

    const handleMouseUp = () => {
      setIsDraggingRightSplit(false);
      setStorageItem("web_viewer_width", viewerWidth.toString());
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingRightSplit, dossierWidth, viewerWidth]);

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
    if (normalizeCaseId(caseId) === "case_000") {
      clearInvestigationStorage();
    } else {
      [
        "intro_seen",
        "solved_followups",
        "reinvestigate_unlocked",
        "indictment_solved",
      ].forEach((k) => setStorageItem(caseStorageKey(caseId, k), ""));
    }
    window.location.reload();
  };

  const pdfItems = useMemo(() => {
    return (effectiveItems as CombinedItem[])
      .filter((item: CombinedItem) => {
        if (!isPhaseUnlocked(item.phase)) return false;
        if (item.type !== "pdf") return false;
        if (selectedPhaseFilter !== "all" && item.phase !== selectedPhaseFilter)
          return false;
        return true;
      })
      .sort((a: CombinedItem, b: CombinedItem) => a.order - b.order);
  }, [effectiveItems, isPhaseUnlocked, selectedPhaseFilter]);

  const evidenceItems = useMemo(() => {
    return (effectiveItems as CombinedItem[])
      .filter((item: CombinedItem) => {
        if (!isPhaseUnlocked(item.phase)) return false;
        if (item.type !== "evidence") return false;
        if (selectedPhaseFilter !== "all" && item.phase !== selectedPhaseFilter)
          return false;
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
      className="h-full w-full bg-[#0d0a08] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex flex-col items-center justify-start p-0 lg:p-3 box-border min-h-0 min-w-0 select-none"
    >
      {/* MOBILE VIEW SWITCHER (CHỈ HIỂN THỊ TRÊN MÀN HÌNH DI ĐỘNG < LG) */}
      <InvestigationMobileNav
        mobileTab={mobileTab}
        filterTab={filterTab}
        onSelectBoard={() => setMobileTab("board")}
        onSelectDossierTab={(tab: "pdf" | "evidence") => {
          setMobileTab("dossier");
          setFilterTab(tab);
        }}
        onOpenNotebook={() => setActiveModal("notebook")}
      />

      <div className="w-full max-w-[1920px] flex-1 min-h-0 flex flex-col lg:flex-row items-stretch justify-start overflow-hidden min-w-0 relative gap-0 lg:gap-1.5">
        {/* OVERLAY CHỐNG MẤT SỰ KIỆN KHI KÉO THẢ RESIZE TRÊN TOÀN MÀN HÌNH */}
        {(isDraggingLeftSplit || isDraggingRightSplit) && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
        )}

        {/* CỘT 1 (BÊN TRÁI): KHAY HỒ SƠ & VẬT CHỨNG (MANILA ARCHIVAL DOSSIER TRAY) */}
        <DossierTray
          dossierWidth={dossierWidth}
          isDossierCollapsed={isDossierCollapsed}
          isViewerExpanded={isViewerExpanded}
          mobileTab={mobileTab}
          filterTab={filterTab}
          onSetFilterTab={(tab) => setFilterTab(tab)}
          selectedPhaseFilter={selectedPhaseFilter}
          onSetPhaseFilter={(val) => setSelectedPhaseFilter(val)}
          isPhaseUnlocked={isPhaseUnlocked}
          pdfItems={pdfItems}
          evidenceItems={evidenceItems}
          selectedView={selectedView}
          onSelectPdf={handleSelectPdf}
          onSelectEvidence={handleSelectEvidence}
          activePing={activePing}
          onBroadcastPing={broadcastPing}
        />

        {/* RESIZABLE SPLIT DRAGGER GIỮA KHAY HỒ SƠ VÀ BẢNG ĐIỀU TRA (DESKTOP) */}
        {!isDossierCollapsed && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingLeftSplit(true);
            }}
            className={cn(
              "hidden lg:flex w-2 items-center justify-center cursor-col-resize select-none shrink-0 group relative z-20 py-2",
              isDraggingLeftSplit && "cursor-col-resize",
            )}
            title="Kéo để điều chỉnh độ rộng Khay tài liệu vs. Bảng điều tra"
          >
            <div
              className={cn(
                "w-1 h-14 rounded-full bg-[#4a3625] group-hover:bg-[#d9a066] group-hover:scale-y-125 transition-all flex items-center justify-center",
                isDraggingLeftSplit &&
                  "bg-[#d9a066] scale-y-150 shadow-[0_0_8px_#d9a066]",
              )}
            >
              <GripVertical className="size-3 text-[#1a0f07] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* CỘT 2 (Ở GIỮA): BẢNG GHIM ĐIỀU TRA (INVESTIGATION CANVAS) */}
        <div
          className={cn(
            "h-full flex-1 min-w-0 bg-[#16120e] border border-[#2d1e13] rounded-none overflow-hidden flex flex-col min-h-0 relative shadow-inner",
            (isDraggingLeftSplit || isDraggingRightSplit) && "transition-none",
            mobileTab === "board" ? "flex w-full" : "hidden lg:flex",
          )}
        >
          {/* MAIN CANVAS */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <MainInvestigationCanvas
              caseId={caseId}
              isBoardGame={false}
              hideTitleBadgeOnMobile={true}
              onOpenPhoneSimulator={() => setActiveModal("phone")}
              onOpenReinvestigation={() => setActiveModal("reinvestigate")}
              onOpenEpilogue={() => setActiveModal("epilogue")}
              onOpenNotebook={() => setActiveModal("notebook")}
            />
          </div>
        </div>

        {/* RESIZABLE SPLIT DRAGGER GIỮA BẢNG ĐIỀU TRA VÀ TRÌNH DUYỆT CHI TIẾT (DESKTOP) */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingRightSplit(true);
          }}
          className={cn(
            "hidden lg:flex w-2 items-center justify-center cursor-col-resize select-none shrink-0 group relative z-20 py-2",
            isDraggingRightSplit && "cursor-col-resize",
          )}
          title="Kéo để điều chỉnh độ rộng Bảng điều tra vs. Trình đọc chi tiết"
        >
          <div
            className={cn(
              "w-1 h-14 rounded-full bg-[#4a3625] group-hover:bg-[#d9a066] group-hover:scale-y-125 transition-all flex items-center justify-center",
              isDraggingRightSplit &&
                "bg-[#d9a066] scale-y-150 shadow-[0_0_8px_#d9a066]",
            )}
          >
            <GripVertical className="size-3 text-[#1a0f07] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* CỘT 3 (BÊN PHẢI): TRÌNH DUYỆT CHI TIẾT HỒ SƠ & VẬT CHỨNG (RIGHT VIEWER INSPECTOR) */}
        <div
          style={{
            width: `${viewerWidth}px`,
          }}
          className={cn(
            "hidden lg:flex shrink-0 min-w-[320px] h-full flex-col min-h-0 overflow-hidden relative border-l border-[#2d1e13]",
            (isDraggingLeftSplit || isDraggingRightSplit) && "transition-none",
          )}
        >
          {activeModal === "phone" ? (
            /* ĐIỆN THOẠI NHÚNG INLINE — DESKTOP ONLY */
            <div className="flex-1 h-full flex flex-col min-h-0 overflow-hidden bg-[#0A0A0C]">
              {/* Toolbar nhỏ phía trên */}
              <div className="shrink-0 h-10 px-3 flex items-center justify-between bg-[#0A0A0C] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#FF453A] animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                    Điện thoại nạn nhân
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/evidence/victim-phone"
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C1C1E] text-zinc-400 hover:text-white border border-white/10 text-[11px] font-sans transition-all"
                  >
                    <ExternalLink className="size-3" />
                    <span>Mở riêng</span>
                  </Link>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C1C1E] text-zinc-400 hover:text-white border border-white/10 text-[11px] font-sans transition-all cursor-pointer"
                  >
                    <X className="size-3" />
                    <span>Đóng</span>
                  </button>
                </div>
              </div>
              {/* Phone Simulator */}
              <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                <PhoneSimulator
                  onClose={() => setActiveModal(null)}
                  device={caseId ? { caseId } : undefined}
                />
              </div>
            </div>
          ) : activeModal === "reinvestigate" ? (
            <ReinvestigationModal
              caseId={caseId}
              isOpen
              inline={!isReinvestigationExpanded}
              onExpand={() => setIsReinvestigationExpanded(true)}
              onClose={() => {
                setIsReinvestigationExpanded(false);
                setActiveModal(null);
              }}
            />
          ) : (
            /* EVIDENCE DETAIL INSPECTOR */
            <EvidenceDetailInspector
              selectedView={selectedView}
              caseId={caseId}
            />
          )}
        </div>
      </div>

      {/* PHASE UNLOCKED CINEMATIC STORY MODAL */}
      <PhaseUnlockedModal
        unlockedModalData={unlockedModalData}
        playExperience="web"
        onClose={() => setUnlockedModalData(null)}
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

      {/* POST-CASE EPILOGUE STORIES MODAL */}
      <EpilogueModal
        caseId={caseId}
        isOpen={activeModal === "epilogue"}
        onClose={() => setActiveModal(null)}
      />

      {/* QUICK ACTION FAB MENU */}
      {activeModal !== "reinvestigate" && (
        <QuickActionFab
          onOpenBoardGame={() => {
            detectiveAudio.playPaperRustle();
            router.push("/evidence/boardgame");
          }}
          onResetCase={resetAllProgress}
          onGoHome={() => router.push("/")}
        />
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

      {/* DETECTIVE NOTEBOOK MODAL */}
      <DetectiveNotebookModal
        isOpen={activeModal === "notebook"}
        onClose={() => setActiveModal(null)}
        caseId={caseId}
      />

      {/* MOBILE FULL SCREEN MODAL */}
      <PDFViewerModal
        isOpen={activeModal === "mobile_pdf"}
        selectedView={selectedView}
        pdfUrl={selectedView.type === "pdf" ? selectedView.data.url : null}
        title={selectedView.data.title}
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
