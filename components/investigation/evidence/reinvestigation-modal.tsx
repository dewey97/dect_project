"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Search,
  Save,
  Move,
  Link2,
  FileText,
  Maximize2,
} from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { useCaseEvidence } from "@/lib/hooks/use-case-evidence";
import { normalizeImageUrl } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { Scene360Viewer } from "@/components/investigation/scene-360-viewer";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { getCase360Config } from "@/lib/actions/evidence-actions";

interface ReinvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  /** Nếu true: render inline trong container cha (không fullscreen fixed). Desktop Zone 3 mode. */
  inline?: boolean;
  /** Callback khi ấn nút mở toàn màn hình (chỉ hiển thị khi inline=true) */
  onExpand?: () => void;
}

export interface ReinvestigationHotspot2D {
  id: string;
  num: number;
  photoId?: string; // Mã vật chứng trong case_evidence (VD: photo_bua_yeu, p1, photo_keo_toc...)
  title?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  yaw?: number; // Tọa độ góc nhìn 360 (-180 to 180)
  pitch?: number; // Tọa độ góc nhìn 360 (-85 to 85)
  imageUrl: string;
  driveUrl?: string;
  soundFile: string;
  soundCaption: string;
}

interface RawSheetPhotoItem {
  id?: string;
  code?: string;
  photo_code?: string;
  photo_id?: string;
  drive_url?: string;
  direct_cdn_url?: string;
  url?: string;
  photo_url?: string;
  link_anh?: string;
  image_url?: string;
  label?: string;
  title?: string;
  Title?: string;
  file_name?: string;
  filename?: string;
  ten_anh?: string;
  "tên ảnh"?: string;
  description_prompt?: string;
  description?: string;
  note?: string;
  location?: string;
  category?: string;
  board_x?: string | number;
  board_y?: string | number;
  x?: string | number;
  y?: string | number;
}

// SFX HIỆU ỨNG ÂM THANH CÓ SẴN
const SFX_OPTIONS = [
  {
    file: "train_sound.mp3",
    label: "Còi tàu & chuông đường sắt",
    caption: "*Tu tu... Xình xịch...*",
  },
  {
    file: "sound_tu.mp3",
    label: "Kẹt then cửa sắt / Tủ gỗ",
    caption: "*Két... Cạch...*",
  },
  {
    file: "breaking.mp3",
    label: "Mảnh ấm chén rơi vỡ",
    caption: "*Choang! Xoảng...*",
  },
  {
    file: "Clack.mp3",
    label: "Cạch then cửa hậu",
    caption: "*Cạch... cạch...*",
  },
  {
    file: "sat_soat.mp3",
    label: "Giấy sột soạt / Khăn giấy",
    caption: "*Sột soạt... sột soạt...*",
  },
  {
    file: "ceramic_shatter.mp3",
    label: "Gốm sứ vỡ vụn",
    caption: "*Xoảng...*",
  },
  { file: "glass_break.mp3", label: "Thủy tinh vỡ", caption: "*Choang!*" },
  {
    file: "ha_voicemail_2032.mp3",
    label: "Thì thầm ma mị",
    caption: "*Thì thào...*",
  },
  {
    file: "heartbeat.mp3",
    label: "Nhịp tim dồn dập",
    caption: "*Thình thịch...*",
  },
  {
    file: "paper_rustle.mp3",
    label: "Lật trang hồ sơ",
    caption: "*Xào xạc...*",
  },
];


export function ReinvestigationModal({
  isOpen,
  onClose,
  caseId = "case_000",
  inline = false,
  onExpand,
}: ReinvestigationModalProps) {
  // Hotspots list with server + localStorage persistence
  const [hotspots, setHotspots] = useState<ReinvestigationHotspot2D[]>([]);
  const [selectedSpot, setSelectedSpot] =
    useState<ReinvestigationHotspot2D | null>(null);
  const [activeAudioToast, setActiveAudioToast] = useState<string | null>(null);
  const dragDistanceRef = useRef(0);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Infinite horizontal pan state & refs
  const [offsetX, setOffsetX] = useState(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 1200,
    height: 800,
  });

  // Gameplay state (read-only)

  // Fetch live photos & hotspots from Supabase (case_evidence)
  const { rawEvidence: rawSheetPhotos, loading: isPhotosLoading } =
    useCaseEvidence(caseId);

  // Load hotspots from Server API, falling back to localStorage
  useEffect(() => {
    let mounted = true;
    async function loadSavedHotspots() {
      try {
        const res = await fetch(
          `/api/reinvestigation?case=${encodeURIComponent(caseId)}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = await res.json();
          if (
            mounted &&
            data.success &&
            Array.isArray(data.hotspots) &&
            data.hotspots.length > 0
          ) {
            setHotspots(data.hotspots);
            return;
          }
        }
      } catch {}

      if (typeof window !== "undefined") {
        const saved =
          localStorage.getItem(`reinvestigate_custom_hotspots_${caseId}`) ||
          localStorage.getItem("reinvestigate_custom_hotspots");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && mounted) {
              setHotspots(parsed);
            }
          } catch {}
        }
      }
    }

    if (isOpen) {
      loadSavedHotspots();
    }

    return () => {
      mounted = false;
    };
  }, [isOpen, caseId]);



  // Đọc ảnh 360 / Panorama theo case từ DB (M12 / WT-2)
  const [sceneConfig, setSceneConfig] = useState<{
    panorama_url?: string | null;
    scene_360_url?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    getCase360Config(caseId || "")
      .then((res) => {
        if (!mounted) return;
        if (
          res.success &&
          res.data &&
          (res.data.panorama_url || res.data.scene_360_url)
        ) {
          setSceneConfig({
            panorama_url: res.data.panorama_url,
            scene_360_url: res.data.scene_360_url,
          });
        } else {
          setSceneConfig(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setSceneConfig(null);
        }
      });
    return () => {
      mounted = false;
    };
  }, [isOpen, caseId]);

  // Process case evidence photos: Map by photo_code ID & Title
  const sheetPhotosList = useMemo(() => {
    if (!Array.isArray(rawSheetPhotos)) return [];
    return (rawSheetPhotos as RawSheetPhotoItem[])
      .filter((item: RawSheetPhotoItem) =>
        Boolean(
          item.drive_url ||
          item.direct_cdn_url ||
          item.url ||
          item.photo_url ||
          item.link_anh ||
          item.image_url,
        ),
      )
      .map((item: RawSheetPhotoItem, idx: number) => {
        const photoCode =
          item.code ||
          item.photo_code ||
          item.photo_id ||
          item.id ||
          `photo-${idx + 1}`;
        const driveUrl = item.drive_url || "";
        const rawUrl =
          item.direct_cdn_url ||
          item.drive_url ||
          item.url ||
          item.photo_url ||
          item.link_anh ||
          item.image_url ||
          "";
        const normUrl = normalizeImageUrl(rawUrl);
        const title =
          item.label ||
          item.title ||
          item.Title ||
          item.file_name ||
          item.filename ||
          item.ten_anh ||
          item["tên ảnh"] ||
          `Ảnh #${idx + 1}`;
        return {
          id: photoCode, // ID code / photo_code chuẩn trong sheet
          title,
          url: normUrl,
          driveUrl,
          description:
            item.description_prompt || item.description || item.note || "",
          location: item.location || "",
          category: item.category || "VẬT CHỨNG",
          board_x: item.board_x || item.x || "",
          board_y: item.board_y || item.y || "",
        };
      });
  }, [rawSheetPhotos]);

  // DYNAMICALLY SYNC HOTSPOTS FROM GOOGLE SHEETS BY photoId, code (C-01..C-05), or title
  // Nếu Sheet cập nhật link Drive hay title cho photoId, game tự động đọc theo photoId mới nhất!
  const resolvedHotspots = useMemo(() => {
    if (hotspots.length === 0) {
      // Tự động trích xuất các điểm khám xét từ dữ liệu vụ án trong database
      const customSpots = sheetPhotosList.filter(
        (p) =>
          p.category?.toLowerCase().includes("reinvestigat") ||
          p.category?.toLowerCase().includes("khám xét") ||
          p.category?.toLowerCase().includes("hotspot") ||
          (p.board_x && p.board_y),
      );
      if (customSpots.length > 0) {
        return customSpots.map((p, idx) => ({
          id: p.id || `spot-${idx + 1}`,
          num: idx + 1,
          photoId: p.id,
          title: p.title || `Vật chứng #${idx + 1}`,
          x: parseFloat(String(p.board_x)) || 20 + idx * 20,
          y: parseFloat(String(p.board_y)) || 50,
          imageUrl: p.url,
          driveUrl: p.driveUrl,
          soundFile: "sat_soat.mp3",
          soundCaption: p.description ? `*${p.description}*` : "*Sột soạt...*",
        }));
      }
    }

    if (sheetPhotosList.length === 0) return hotspots;

    return hotspots.map((spot) => {
      if (!spot.photoId) return spot;
      const pid = (spot.photoId || "").toLowerCase();
      const spotTitle = (spot.title || "").toLowerCase();

      const matched = sheetPhotosList.find((p) => {
        const idLower = (p.id || "").toLowerCase();
        const titleLower = (p.title || "").toLowerCase();

        if (idLower === pid) return true;
        if (spotTitle && (titleLower.includes(spotTitle) || spotTitle.includes(titleLower)))
          return true;
        return false;
      });
      if (matched) {
        const xNum =
          matched.board_x !== undefined &&
          !isNaN(parseFloat(String(matched.board_x)))
            ? parseFloat(String(matched.board_x))
            : spot.x;
        const yNum =
          matched.board_y !== undefined &&
          !isNaN(parseFloat(String(matched.board_y)))
            ? parseFloat(String(matched.board_y))
            : spot.y;
        return {
          ...spot,
          title: matched.title || spot.title,
          imageUrl: matched.url || spot.imageUrl,
          driveUrl: matched.driveUrl || spot.driveUrl,
          soundCaption: matched.description
            ? `*${matched.description}*`
            : spot.soundCaption,
          x: xNum,
          y: yNum,
        };
      }
      return spot;
    });
  }, [hotspots, sheetPhotosList]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Track container dimensions on resize
  useEffect(() => {
    if (!isOpen) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 800,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isOpen]);

  if (!isOpen) return null;

  const playCustomSfx = (_filename: string) => {
    // Tạm ẩn âm thanh theo yêu cầu
  };

  // Handle clicking a hotspot pin on the scene
  const handleSpotClick = (spot: ReinvestigationHotspot2D) => {
    if (dragDistanceRef.current > 8) return;
    setSelectedSpot(spot);
  };

  // Pointer drag event handlers for smooth infinite horizontal loop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    dragDistanceRef.current = 0;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    dragDistanceRef.current += Math.abs(dx);
    velocityRef.current = dx;
    setOffsetX((prev) => prev + dx);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const applyMomentum = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) > 0.3) {
        setOffsetX((prev) => prev + velocityRef.current);
        animFrameRef.current = requestAnimationFrame(applyMomentum);
      }
    };
    if (Math.abs(velocityRef.current) > 1.2) {
      animFrameRef.current = requestAnimationFrame(applyMomentum);
    }
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    setOffsetX((prev) => prev - delta * 0.9);
  };

  const handleNudge = (direction: "left" | "right") => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    velocityRef.current = direction === "left" ? 22 : -22;
    const applyMomentum = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) > 0.3) {
        setOffsetX((prev) => prev + velocityRef.current);
        animFrameRef.current = requestAnimationFrame(applyMomentum);
      }
    };
    animFrameRef.current = requestAnimationFrame(applyMomentum);
  };

  // Calculate dynamic dimensions for seamless wrapping
  const imageAspect = 4096 / 2286;
  const renderedHeight = containerSize.height || 800;
  const renderedWidth = renderedHeight * imageAspect;

  // Calculate seamless normalized offset in range [-renderedWidth, 0]
  const normalizedX =
    renderedWidth > 0
      ? (((offsetX % renderedWidth) + renderedWidth) % renderedWidth) -
        renderedWidth
      : 0;

  // Khi inline=true trên desktop: render như block bình thường trong Zone 3
  // Khi inline=false (mobile/fullscreen): render fixed overlay
  const rootClassName = inline
    ? "flex flex-col w-full h-full bg-[#080503] font-mono text-[#f4e8d8] select-none overflow-hidden"
    : "fixed inset-0 bg-[#080503] z-[100] flex flex-col font-mono text-[#f4e8d8] select-none overflow-hidden w-screen h-[100dvh] pt-safe";

  return (
    <div className={rootClassName}>
      {/* SCANLINES EFFECT */}
      <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-15 z-10" />

      {/* TOP HEADER / STATUS BAR - CLEAN NO CLUTTER */}
      <div className="relative z-30 bg-[#160d07] border-b-2 border-[#3d2412] px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#f5ebd9] tracking-wider uppercase">
                KHÁM XÉT LẠI HIỆN TRƯỜNG (3D / 360°)
              </span>
            </div>
            <p className="text-[11px] text-[#9e7a56] hidden sm:block">
              Kéo chuột hoặc vuốt để xoay nhìn toàn cảnh 3D hiện trường • Nhấp
              vào các điểm đỏ để soi chi tiết
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {inline && onExpand && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="p-2 bg-[#2b170c] hover:bg-[#422413] border border-[#59341c] text-[#d9a066] hover:text-white rounded-none transition-colors cursor-pointer pointer-events-auto"
              title="Mở toàn màn hình"
              aria-label="Mở toàn màn hình"
            >
              <Maximize2 className="size-5 pointer-events-none" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              detectiveAudio.playPaperRustle();
              onClose();
            }}
            className="p-2 bg-[#2b170c] hover:bg-[#422413] border border-[#59341c] text-[#d9a066] hover:text-white rounded-none transition-colors cursor-pointer ml-1 pointer-events-auto"
            title="Đóng bảng khám xét"
          >
            <X className="size-5 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* MAIN VIEW AREA: TRUE 3D / 360° SPHERICAL WEBGL CANVAS */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#060402]">
        <Scene360Viewer
          imageUrl={sceneConfig?.scene_360_url || undefined}
          fallbackImageUrl={sceneConfig?.panorama_url || undefined}
          hotspots={resolvedHotspots}
          onSelectSpot={(spot) => {
            const matched = resolvedHotspots.find((s) => s.id === spot.id);
            if (matched) {
              handleSpotClick(matched);
            }
          }}
          selectedSpotId={selectedSpot?.id}
        />
      </div>

      {/* LIGHTBOX PHOTO ZOOM MODAL (REGULAR PLAYER VIEW) */}
      <AnimatePresence>
        {selectedSpot && (
          <div
            onClick={() => setSelectedSpot(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-8 cursor-zoom-out select-none"
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[92vw] max-h-[88vh] flex flex-col items-center justify-center"
            >
              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="absolute -top-3 -right-3 z-30 p-2 bg-[#1a0f08] hover:bg-[#331c0e] border-2 border-[#59341c] text-[#f4e8d8] rounded-full shadow-2xl transition-all cursor-pointer"
                title="Đóng ảnh"
              >
                <X className="size-5" />
              </button>

              {/* HIGH-RES EVIDENCE PHOTO FROM GOOGLE SHEETS */}
              <img
                src={selectedSpot.imageUrl}
                alt={selectedSpot.title || `Vật chứng #${selectedSpot.num}`}
                className="max-w-[92vw] max-h-[82vh] object-contain shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-2 border-[#3d2412] rounded-none bg-[#0a0604]"
              />

              {/* CAPTION INFO BELOW PHOTO */}
              {selectedSpot.title && (
                <div className="mt-2.5 px-4 py-1.5 bg-[#140e08]/90 border border-[#59341c] rounded text-xs text-[#e8d5c4] font-mono text-center max-w-xl backdrop-blur-sm">
                  <span className="font-bold text-amber-300">
                    Điểm {selectedSpot.num}:
                  </span>{" "}
                  {selectedSpot.title}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUDIO SUBTITLE TOAST AT BOTTOM LEFT (TẠM ẨN THEO YÊU CẦU) */}
      {/*
      <AnimatePresence>
        {activeAudioToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-50 bg-[#120a05]/95 border border-[#59341c] text-[#f4e8d8] px-4 py-2.5 rounded shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm pointer-events-none"
          >
            <Volume2 className="size-4 text-amber-400 shrink-0" />
            <motion.span
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="font-mono text-sm text-[#f5ebd9] italic font-semibold tracking-wider"
            >
              {activeAudioToast}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      */}
    </div>
  );
}
