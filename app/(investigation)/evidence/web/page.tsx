"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Paperclip,
  ImageIcon,
  Volume2,
  VolumeX,
  Box,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  GripVertical,
  Eye,
  Layers,
  FolderOpen,
  Search,
} from "lucide-react";
import { PDFViewerModal } from "@/components/investigation/pdf-viewer-modal";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";

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
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import { JumpscareEndgame } from "@/components/investigation/jumpscare-endgame";
import { QuickActionFab } from "@/components/investigation/evidence/quick-action-fab";
import { PhoneModal } from "@/components/investigation/evidence/phone-modal";
import { ReinvestigationModal } from "@/components/investigation/evidence/reinvestigation-modal";
import { HintModal } from "@/components/investigation/hint-modal";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { normalizeImageUrl } from "@/lib/utils";
import {
  getStorageItem,
  setStorageItem,
  clearInvestigationStorage,
  getStorageJson,
} from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";

type ActiveModal =
  | "phone"
  | "reinvestigate"
  | "epilogue"
  | "hint"
  | "mobile_pdf"
  | null;

function WebEvidencePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId =
    searchParams.get("case_id") || searchParams.get("caseId") || "case-000";
  const normalizedSheetCaseId = useMemo(
    () => caseId.replace(/-/g, "_"),
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

  // 3-Zone Layout State (Desktop):
  // Zone 1 (Bảng Điều Tra): width %
  // Zone 2 (Danh mục Preview Card ở giữa): width cố định (240px -> 320px) hoặc tự co giãn
  // Zone 3 (Trình duyệt chi tiết PDF / Vật chứng bên phải)
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);
  const [isViewerExpanded, setIsViewerExpanded] = useState<boolean>(false); // Phóng to trình đọc PDF toàn nửa phải
  const [boardWidthPercent, setBoardWidthPercent] = useState<number>(60);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Phase filter: 'all' | 0 | 1 | 2 | 3
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<
    "all" | number
  >("all");

  const [activeHintCheckpointId, setActiveHintCheckpointId] = useState<string | undefined>(undefined);
  const [activeHintCategory, setActiveHintCategory] = useState<"motive" | "alibi" | undefined>(undefined);

  // Event bus listeners
  useInvestigationEvent("OPEN_EPILOGUE", () => setActiveModal("epilogue"));
  useInvestigationEvent("OPEN_PHONE", () => setActiveModal("phone"));
  useInvestigationEvent("OPEN_HINT", (e: any) => {
    const cpId = e?.detail?.checkpointId || (typeof e?.detail === "string" ? e.detail : undefined);
    const cat = e?.detail?.category || (typeof e?.detail === "object" ? e.detail?.category : undefined);
    setActiveHintCheckpointId(cpId);
    setActiveHintCategory(cat);
    setActiveModal("hint");
  });
  // Hợp nhất dữ liệu Live Sheet (tab 'evidences') với Fallback local:
  // Nếu Sheet có dữ liệu, ưu tiên nạp từ Sheet; nếu một mục chưa có link Drive thì dùng link PDF/ảnh local tương ứng
  const effectiveItems = useMemo(() => {
    if (!sheetEvidences || sheetEvidences.length === 0) {
      if (caseId !== "case-000") return [];
      // Fallback khi chưa nạp xong Sheet cho case-000
      return [
        ...CASE_000_PDFS.map((doc): CombinedItem => ({
          type: "pdf",
          data: doc,
          phase: doc.phase,
          order: doc.order,
        })),
        ...CASE_000_EVIDENCE.map((item): CombinedItem => ({
          type: "evidence",
          data: item,
          phase: item.phase,
          order: item.order,
        })),
      ];
    }

    // Lọc bỏ avatar nhân vật và scene chỉ dùng cho bảng ghim
    const validRows = sheetEvidences.filter((row: any) => {
      const c = String(row.code || "").trim();
      return c && !c.startsWith("avatar_") && c !== "crime_scene";
    });

    return validRows.map((row: any, idx: number): CombinedItem => {
      const code = String(row.code || "").trim();
      const title = String(row.label || row.title || `Vật chứng #${code}`).trim();
      const driveUrl = String(row.drive_url || "").trim();
      const cat = String(row.category || "").toUpperCase();
      const boStr = String(row["bộ hồ sơ"] || "").toUpperCase();

      // Xác định Phase dựa theo nhãn 'Bộ hồ sơ' trên Sheet (A = 1, B = 2, C = 3, D = 3, còn lại mặc định 0)
      let phase = 0;
      if (boStr === "A" || code.startsWith("A-")) phase = 1;
      else if (boStr === "B" || code.startsWith("B-") || boStr === "E" || code.startsWith("E-")) phase = 2;
      else if (boStr === "C" || code.startsWith("C-") || boStr === "D" || code.startsWith("D-")) phase = 3;

      // Phân loại: Nếu có chứa chữ 'Ảnh' hoặc category = 'FORENSIC' / 'SCENE' -> type 'evidence' (Ảnh)
      // Nếu có category = 'DOCUMENT' / 'DOSSIER' hoặc tên biên bản/lý lịch/lời khai -> type 'pdf'
      const isPhoto =
        title.toLowerCase().includes("ảnh") ||
        cat === "FORENSIC" ||
        cat === "SCENE" ||
        title.toLowerCase().includes("lược") ||
        title.toLowerCase().includes("hoa xoan") ||
        title.toLowerCase().includes("bùa yêu");

      if (isPhoto) {
        // Tìm ảnh fallback local nếu chưa có Drive link
        const localFallback = caseId === "case-000" ? CASE_000_EVIDENCE.find(
          (e) => e.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(e.title.toLowerCase())
        ) : undefined;
        const imgUrl = driveUrl || localFallback?.thumbnail || "/photo_scene_overview.jpg";

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
      } else {
        // Tài liệu PDF: Tìm link PDF local tương ứng nếu Sheet chưa gắn link Drive
        const localDoc = caseId === "case-000" ? CASE_000_PDFS.find(
          (d) => d.code === code || d.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(d.title.toLowerCase())
        ) : undefined;
        const docUrl = driveUrl || localDoc?.url || "/documents/case_000/00_khoi_dau/00_huong_dan_ban_dau.pdf";

        return {
          type: "pdf",
          phase,
          order: idx * 10,
          data: {
            id: `sheet-${code}`,
            code,
            title,
            url: docUrl,
            phase,
            order: idx * 10,
          },
        };
      }
    });
  }, [sheetEvidences, caseId]);

  useEffect(() => {
    setStorageItem("play_experience", "web");

    const introKey = caseId === "case-000" ? "intro_seen" : `${caseId}::intro_seen`;
    const isIntroSeen = getStorageItem(introKey);
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

    // Check current unlocked phase from boardgame progress
    const solvedFollowups = getStorageJson<string[]>(
      caseId === "case-000" ? "solved_followups" : `${caseId}::solved_followups`,
      [],
    );
    const isReinvestigateUnlocked =
      getStorageItem(
        caseId === "case-000"
          ? "reinvestigate_unlocked"
          : `${caseId}::reinvestigate_unlocked`,
      ) === "true";
    const isIndictmentSolved =
      getStorageItem(
        caseId === "case-000"
          ? "indictment_solved"
          : `${caseId}::indictment_solved`,
      ) === "true";

    if (isIndictmentSolved) {
      setUnlockedPhase(3);
    } else if (isReinvestigateUnlocked || solvedFollowups.length >= 2) {
      setUnlockedPhase(2);
    } else {
      setUnlockedPhase(1);
    }

    // Khôi phục layout preference từ storage
    const savedRatio = getStorageItem("web_board_split_ratio");
    if (savedRatio) {
      const parsed = parseFloat(savedRatio);
      if (!isNaN(parsed) && parsed >= 45 && parsed <= 75) {
        setBoardWidthPercent(parsed);
      } else {
        setBoardWidthPercent(60);
      }
    } else {
      setBoardWidthPercent(60);
    }
    const savedCollapsed = getStorageItem("web_dossier_collapsed");
    if (savedCollapsed === "true") {
      setIsDossierCollapsed(true);
    }
  }, [caseId, effectiveItems]);

  // Xử lý kéo thả thanh phân chia giữa Vùng 1 (Board) và Vùng 2+3 (Dossier)
  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 1024) return; // Chỉ áp dụng trên desktop

      // Giới hạn tỉ lệ Board từ 45% đến 75% để chừa không gian cho Zone 2 & 3
      const newRatio = (e.clientX / windowWidth) * 100;
      const clampedRatio = Math.min(Math.max(newRatio, 45), 75);
      setBoardWidthPercent(clampedRatio);
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
      setStorageItem("web_board_split_ratio", boardWidthPercent.toString());
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSplit, boardWidthPercent]);

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
    detectiveAudio.playTypewriterClick();
    setSelectedView({ type: "pdf", data: doc });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveModal("mobile_pdf");
    } else if (activeModal === "phone") {
      setActiveModal(null);
    }
  };

  const handleSelectEvidence = (item: PhysicalEvidence) => {
    if (!isPhaseUnlocked(item.phase)) return;
    detectiveAudio.playGlassSound();
    setSelectedView({ type: "evidence", data: item });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveModal("mobile_pdf");
    } else if (activeModal === "phone") {
      setActiveModal(null);
    }
  };

  const resetAllProgress = () => {
    if (caseId === "case-000") {
      clearInvestigationStorage();
    } else {
      [
        `${caseId}::intro_seen`,
        `${caseId}::solved_followups`,
        `${caseId}::reinvestigate_unlocked`,
        `${caseId}::indictment_solved`,
      ].forEach((k) => setStorageItem(k, ""));
    }
    window.location.reload();
  };



  const pdfItems = useMemo(() => {
    return (effectiveItems as CombinedItem[])
      .filter((item: CombinedItem) => {
        if (!isPhaseUnlocked(item.phase)) return false;
        if (item.type !== "pdf") return false;
        if (selectedPhaseFilter !== "all" && item.phase !== selectedPhaseFilter) return false;
        return true;
      })
      .sort((a: CombinedItem, b: CombinedItem) => a.order - b.order);
  }, [effectiveItems, isPhaseUnlocked, selectedPhaseFilter]);

  const evidenceItems = useMemo(() => {
    return (effectiveItems as CombinedItem[])
      .filter((item: CombinedItem) => {
        if (!isPhaseUnlocked(item.phase)) return false;
        if (item.type !== "evidence") return false;
        if (selectedPhaseFilter !== "all" && item.phase !== selectedPhaseFilter) return false;
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
        const exists = currentList.some(
          (item) => item.data.id === currentId,
        );
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
      className="h-full w-full bg-[#0d0a08] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex flex-col items-center justify-start p-1.5 sm:p-2 lg:p-3 box-border min-h-0 min-w-0 select-none"
    >
      {/* MOBILE VIEW SWITCHER (CHỈ HIỂN THỊ TRÊN MÀN HÌNH DI ĐỘNG < LG) */}
      <div className="flex lg:hidden shrink-0 items-center justify-between p-1 bg-[#16120e] border border-[#3d2c1e] rounded-xl shadow-md w-full mb-1 z-30">
        <button
          type="button"
          onClick={() => {
            detectiveAudio.playPaperRustle();
            setMobileTab("board");
          }}
          className={cn(
            "flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-mono text-[0.72rem] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            mobileTab === "board"
              ? "bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold"
              : "text-[#ad9885] hover:text-[#e5d8cb]"
          )}
        >
          <Layers className="size-3.5 shrink-0" />
          <span className="truncate">BẢNG ĐIỀU TRA</span>
        </button>
        <button
          type="button"
          onClick={() => {
            detectiveAudio.playPaperRustle();
            setMobileTab("dossier");
          }}
          className={cn(
            "flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-mono text-[0.72rem] sm:text-xs font-bold transition-all cursor-pointer relative whitespace-nowrap",
            mobileTab === "dossier"
              ? "bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold"
              : "text-[#ad9885] hover:text-[#e5d8cb]"
          )}
        >
          <FolderOpen className="size-3.5 shrink-0" />
          <span className="truncate">KHAY TÀI LIỆU</span>
        </button>
      </div>

      <div className="w-full max-w-[1920px] flex-1 min-h-0 flex flex-col lg:flex-row items-stretch justify-center overflow-hidden min-w-0 relative gap-2 sm:gap-2.5">
        {/* VÙNG 1: BẢNG GHIM ĐIỀU TRA (INVESTIGATION CANVAS) */}
        <div
          style={{
            ["--board-split-width" as any]: isDossierCollapsed
              ? "100%"
              : `${boardWidthPercent}%`,
          }}
          className={cn(
            "w-full lg:w-[var(--board-split-width)] h-full shrink-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col min-h-0 relative transition-[width] duration-150 ease-out",
            isDraggingSplit && "transition-none",
            mobileTab === "board" ? "flex" : "hidden lg:flex"
          )}
        >
          {/* TOP RIGHT TOOLBAR: TOGGLE HỒ SƠ FOCUS / SPLIT */}
          <div className="hidden lg:flex absolute top-3 right-3 z-30 items-center gap-1.5 bg-[#1e150e]/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[#4a3625] shadow-xl">
            <span className="font-mono text-[0.62rem] text-[#ad9885] tracking-wider uppercase font-bold">
              {isDossierCollapsed ? "CHẾ ĐỘ TẬP TRUNG (FOCUS)" : "BÀN PHÁ ÁN (3 VÙNG)"}
            </span>
            <button
              onClick={toggleDossierCollapse}
              className="p-1 rounded hover:bg-[#342417] text-[#d9a066] hover:text-[#fef5ec] transition-colors cursor-pointer"
              title={
                isDossierCollapsed
                  ? "Mở thanh Hồ sơ & Trình duyệt (3 vùng)"
                  : "Thu gọn để toàn màn hình Bảng phá án"
              }
            >
              {isDossierCollapsed ? (
                <PanelRightOpen className="size-4" />
              ) : (
                <PanelRightClose className="size-4" />
              )}
            </button>
          </div>

          {/* MAIN CANVAS */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <MainInvestigationCanvas
              caseId={caseId}
              isBoardGame={false}
              hideTitleBadgeOnMobile={true}
              onOpenPhoneSimulator={() => setActiveModal("phone")}
              onOpenReinvestigation={() => setActiveModal("reinvestigate")}
              onOpenEpilogue={() => setActiveModal("epilogue")}
            />
          </div>
        </div>

        {/* RESIZABLE SPLIT DRAGGER GIỮA VÙNG 1 VÀ VÙNG 2 (DESKTOP) */}
        {!isDossierCollapsed && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingSplit(true);
            }}
            className={cn(
              "hidden lg:flex w-2.5 items-center justify-center cursor-col-resize select-none shrink-0 group relative z-20 py-2",
              isDraggingSplit && "cursor-col-resize",
            )}
            title="Kéo để điều chỉnh độ rộng Bảng điều tra vs. Khay hồ sơ"
          >
            <div
              className={cn(
                "w-1 h-14 rounded-full bg-[#4a3625] group-hover:bg-[#d9a066] group-hover:scale-y-125 transition-all flex items-center justify-center",
                isDraggingSplit && "bg-[#d9a066] scale-y-150 shadow-[0_0_8px_#d9a066]",
              )}
            >
              <GripVertical className="size-3 text-[#1a0f07] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* VÙNG 2: KHAY PREVIEW THẺ HỒ SƠ & VẬT CHỨNG (MIDDLE PREVIEW CARDS STRIP) */}
        <div
          style={{
            display:
              typeof window !== "undefined" && window.innerWidth >= 1024 && isDossierCollapsed
                ? "none"
                : undefined,
          }}
          className={cn(
            "w-full lg:w-[210px] xl:w-[230px] shrink-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-lg overflow-hidden flex flex-col h-full min-h-0",
            isDossierCollapsed && "lg:hidden",
            isViewerExpanded && "hidden xl:flex",
            mobileTab === "dossier" ? "flex" : "hidden lg:flex"
          )}
        >
          {/* HEADER VÙNG 2: 2 OPTION TÀI LIỆU VÀ ẢNH */}
          <div className="shrink-0 p-1.5 bg-[#241a12] border-b border-[#3d2c1e] flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle();
                setFilterTab("pdf");
              }}
              className={cn(
                "flex-1 py-1.5 px-2 font-mono text-[0.72rem] sm:text-xs font-bold transition-all cursor-pointer rounded flex items-center justify-center gap-1.5",
                filterTab === "pdf"
                  ? "bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold"
                  : "bg-[#18110b] text-[#ad9885] hover:text-[#e6d3c1] hover:bg-[#2d2015] border border-[#3d2c1e]"
              )}
            >
              <FileText className="size-3.5" />
              <span>TÀI LIỆU</span>
            </button>
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playGlassSound();
                setFilterTab("evidence");
              }}
              className={cn(
                "flex-1 py-1.5 px-2 font-mono text-[0.72rem] sm:text-xs font-bold transition-all cursor-pointer rounded flex items-center justify-center gap-1.5",
                filterTab === "evidence"
                  ? "bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold"
                  : "bg-[#18110b] text-[#ad9885] hover:text-[#e6d3c1] hover:bg-[#2d2015] border border-[#3d2c1e]"
              )}
            >
              <ImageIcon className="size-3.5" />
              <span>ẢNH</span>
            </button>
          </div>

          {/* PHASE FILTER CHIPS */}
          <div className="shrink-0 px-2.5 py-2 border-b border-[#3d2c1e]/60 bg-[#1a1410] flex items-center gap-1.5 overflow-x-auto font-mono custom-scrollbar">
            {[
              { label: "TẤT CẢ", val: "all" as const },
              { label: "BAN ĐẦU", val: 0 },
              { label: "BỘ A", val: 1 },
              { label: "BỘ B", val: 2 },
              { label: "BỘ C", val: 3 },
            ].map((p) => {
              const isLocked =
                typeof p.val === "number" && !isPhaseUnlocked(p.val);
              const isSelected = selectedPhaseFilter === p.val;
              return (
                <button
                  key={p.label}
                  disabled={isLocked}
                  onClick={() => setSelectedPhaseFilter(p.val)}
                  className={cn(
                    "px-2.5 py-1 sm:px-3 sm:py-1 rounded-sm transition-all whitespace-nowrap text-[0.68rem] sm:text-xs font-bold min-h-[26px] flex items-center justify-center",
                    isLocked
                      ? "opacity-35 cursor-not-allowed text-[#6b5847] border border-[#2d2015]"
                      : isSelected
                        ? "bg-[#d9a066] text-[#1a0f07] font-extrabold shadow-xs"
                        : "bg-[#241a12] text-[#ad9885] hover:text-[#e6d3c1] hover:bg-[#342417] border border-[#3e2b1c] cursor-pointer",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* DANH SÁCH PREVIEW THẺ CARD */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0 bg-[#120d09]">
            {filterTab === "evidence" ? (
              /* NẾU LÀ VẬT CHỨNG: HIỂN THỊ DẠNG LƯỚI GRID GỌN GÀNG (2 CỘT) */
              evidenceItems.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-[#8c735d]">
                  Không có vật chứng nào.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {evidenceItems.map((item) => {
                    const isSelected =
                      selectedView.type === item.type &&
                      selectedView.data.id === item.data.id;
                    const evItem = item.data as PhysicalEvidence;

                    return (
                      <button
                        key={`evidence-${item.data.id}`}
                        onClick={() => handleSelectEvidence(evItem)}
                        className={cn(
                          "w-full aspect-[4/3] text-left rounded-none border transition-all cursor-pointer relative overflow-hidden group shadow-sm bg-[#0c0805] active:scale-[0.98]",
                          isSelected
                            ? "lg:border-[#d9a066] lg:shadow-[0_0_12px_rgba(217,160,102,0.3)] border-[#2a1d13]"
                            : "border-[#2a1d13] hover:border-[#4a3423]",
                        )}
                      >
                        <img
                          src={normalizeImageUrl(evItem?.thumbnail) || "/photo_scene_overview.jpg"}
                          alt="Vật chứng"
                          className="w-full h-full object-cover select-none transition-transform duration-200 group-hover:scale-105 rounded-none"
                        />
                        {evItem?.evidenceId && (
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-none bg-black/75 text-[0.55rem] font-mono font-bold text-[#e5d8cb]">
                            {evItem.evidenceId}
                          </div>
                        )}
                        {isSelected && (
                          <div className="hidden lg:block absolute inset-0 border-2 border-[#d9a066] pointer-events-none rounded-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              /* NẾU LÀ HỒ SƠ PDF: DANH SÁCH COMPACT ROW */
              pdfItems.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-[#8c735d]">
                  Không có hồ sơ nào.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {pdfItems.map((item) => {
                    const isSelected =
                      selectedView.type === item.type &&
                      selectedView.data.id === item.data.id;
                    const pdfDoc = item.data as PDFDocument;

                    return (
                      <button
                        key={`pdf-${item.data.id}`}
                        onClick={() => handleSelectPdf(pdfDoc)}
                        className={cn(
                          "w-full text-left rounded-lg border transition-all cursor-pointer p-2 flex items-center gap-2 relative overflow-hidden group shadow-sm active:scale-[0.99] active:bg-[#201710]",
                          isSelected
                            ? "lg:bg-[#2a1d12] lg:border-[#d9a066] lg:shadow-[0_0_12px_rgba(217,160,102,0.2)] bg-[#18120d] border-[#382618]"
                            : "bg-[#18120d] hover:bg-[#201710] border-[#382618] hover:border-[#523824]",
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[0.65rem] font-bold tracking-wider transition-colors",
                            isSelected
                              ? "lg:text-[#d9a066] text-[#d9a066]/80"
                              : "text-[#d9a066]/80 group-hover:text-[#d9a066]"
                          )}
                        >
                          {pdfDoc?.code || "DOC"}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "font-bold text-[0.68rem] leading-snug line-clamp-2 transition-colors",
                              isSelected
                                ? "lg:text-[#fef5ec] text-[#ad9885] group-hover:text-[#e6d3c1]"
                                : "text-[#ad9885] group-hover:text-[#e6d3c1]",
                            )}
                          >
                            {item.data.title}
                          </p>
                        </div>

                        <ChevronRight className="size-3.5 text-[#5a422e] shrink-0 group-hover:text-[#d9a066] group-active:text-[#d9a066] transition-colors" />

                        {isSelected && (
                          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-[#d9a066]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* VÙNG 3: TRÌNH DUYỆT CHI TIẾT HỒ SƠ & VẬT CHỨNG (RIGHT VIEWER INSPECTOR) */}
        <div
          style={{
            display: isDossierCollapsed ? "none" : undefined,
          }}
          className={cn(
            "hidden lg:flex flex-1 min-w-0 h-full flex-col min-h-0 overflow-hidden relative",
            isDossierCollapsed && "lg:hidden",
          )}
        >
          {/* HEADER TOOLBAR VÙNG 3 */}
          <div className="hidden lg:flex absolute top-3 right-3 z-40 items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setIsViewerExpanded((prev) => !prev)}
              className="p-1.5 px-2 bg-[#1b140e]/90 hover:bg-[#322014] text-[#ad9885] hover:text-[#fef5ec] rounded border border-[#4a3625] transition-colors cursor-pointer flex items-center gap-1 font-mono text-[0.6rem] shadow-md backdrop-blur-sm"
              title={isViewerExpanded ? "Thu nhỏ về 3 vùng" : "Phóng to toàn khung phải"}
            >
              {isViewerExpanded ? (
                <>
                  <Minimize2 className="size-3 text-[#d9a066]" />
                  <span>CHUẨN</span>
                </>
              ) : (
                <>
                  <Maximize2 className="size-3 text-[#d9a066]" />
                  <span>MỞ RỘNG</span>
                </>
              )}
            </button>
          </div>

          <EvidenceDetailInspector selectedView={selectedView} />
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

      {/* VICTIM PHONE SIMULATOR MODAL */}
      <PhoneModal
        caseId={caseId}
        isOpen={activeModal === "phone"}
        onClose={() => setActiveModal(null)}
      />

      {/* RE-INVESTIGATION CRIME SCENE MODAL */}
      <ReinvestigationModal
        caseId={caseId}
        isOpen={activeModal === "reinvestigate"}
        onClose={() => setActiveModal(null)}
      />

      {/* MOBILE FULL SCREEN MODAL */}
      <PDFViewerModal
        isOpen={activeModal === "mobile_pdf"}
        selectedView={selectedView}
        pdfUrl={selectedView.type === "pdf" ? selectedView.data.url : null}
        title={selectedView.data.title}
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
