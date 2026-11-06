"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { CanvasStickyNote } from "@/lib/types/room";
import type { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { STICKY_NOTE_COLORS } from "./presets";

type Positions = Record<string, { x: number; y: number }>;

interface StickyNotesArgs {
  caseId: string;
  roomCode: string | null | undefined;
  /** Notes from the shared room state (group play). */
  remoteNotes: CanvasStickyNote[] | undefined;
  syncUpdate: ReturnType<typeof useRoomSync>["syncUpdate"];
  nickname: string | null | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
  zoomScaleRef: RefObject<number>;
  panRef: RefObject<{ x: number; y: number }>;
  storagePosKey: string;
  setCustomPositions: Dispatch<SetStateAction<Positions>>;
  /** Called after a note is added (close the popup, back to cursor). */
  onAdded: () => void;
}

/**
 * Sticky notes on the dossier canvas. Solo play keeps them in localStorage;
 * group play syncs them through the room state (the note being typed keeps
 * its local text until the debounce sends it).
 */
export function useStickyNotes({
  caseId,
  roomCode,
  remoteNotes,
  syncUpdate,
  nickname,
  containerRef,
  zoomScaleRef,
  panRef,
  storagePosKey,
  setCustomPositions,
  onAdded,
}: StickyNotesArgs) {
  const storageNotesKey = `dect_dossier_canvas_notes_${caseId}`;
  const [stickyNotes, setStickyNotes] = useState<CanvasStickyNote[]>([]);
  const stickyNotesRef = useRef<CanvasStickyNote[]>(stickyNotes);
  const typingNoteIdRef = useRef<string | null>(null);
  const saveNoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    stickyNotesRef.current = stickyNotes;
  }, [stickyNotes]);

  // Nạp sticky notes từ localStorage khi chơi đơn
  useEffect(() => {
    if (!roomCode) {
      try {
        const saved = localStorage.getItem(storageNotesKey);
        if (saved) {
          setStickyNotes(JSON.parse(saved));
        }
      } catch {
        // Ignore
      }
    }
  }, [storageNotesKey, roomCode]);

  // Đồng bộ sticky notes theo thời gian thực từ Room Group Play
  useEffect(() => {
    if (roomCode && remoteNotes !== undefined) {
      setStickyNotes((prev) => {
        const remote = remoteNotes || [];
        const editingId = typingNoteIdRef.current;
        if (editingId) {
          return remote.map((rn) => {
            if (rn.id === editingId) {
              const currentLocal = prev.find((n) => n.id === editingId);
              return currentLocal ? { ...rn, content: currentLocal.content } : rn;
            }
            return rn;
          });
        }
        return remote;
      });
    }
  }, [roomCode, remoteNotes]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveNoteTimeoutRef.current) {
        clearTimeout(saveNoteTimeoutRef.current);
      }
    };
  }, []);

  const saveStickyNotes = useCallback((notes: CanvasStickyNote[]) => {
    setStickyNotes(notes);
    try {
      localStorage.setItem(storageNotesKey, JSON.stringify(notes));
    } catch {
      // Ignore
    }
  }, [storageNotesKey]);

  // Thêm một giấy dán note mới
  const handleAddStickyNote = useCallback(
    (color = "#fef08a") => {
      const container = containerRef.current;
      const zoom = zoomScaleRef.current;
      const currentPan = panRef.current;
      const rect = container?.getBoundingClientRect() || {
        width: 1000,
        height: 700,
        left: 0,
        top: 0,
      };

      const screenCenterX = rect.width / 2;
      const screenCenterY = rect.height / 2;
      const jitterX = (Math.random() - 0.5) * 60;
      const jitterY = (Math.random() - 0.5) * 60;
      const canvasX = Math.round((screenCenterX - currentPan.x) / zoom - 110 + jitterX);
      const canvasY = Math.round((screenCenterY - currentPan.y) / zoom - 110 + jitterY);

      const newId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newNote: CanvasStickyNote = {
        id: newId,
        x: canvasX,
        y: canvasY,
        content: "",
        color,
        createdAt: Date.now(),
        authorName: nickname || "Thám tử",
      };

      setCustomPositions((prev) => {
        const next = { ...prev, [newId]: { x: canvasX, y: canvasY } };
        try {
          localStorage.setItem(storagePosKey, JSON.stringify(next));
        } catch {}
        return next;
      });

      const nextNotes = [...stickyNotesRef.current, newNote];
      saveStickyNotes(nextNotes);
      if (roomCode) {
        syncUpdate({ canvasNotes: nextNotes }, "vừa dán một mẩu note lên bàn");
      }
      onAdded();
    },
    [saveStickyNotes, storagePosKey, roomCode, syncUpdate, nickname, onAdded, containerRef, zoomScaleRef, panRef, setCustomPositions]
  );

  const handleUpdateStickyNote = useCallback(
    (id: string, content: string) => {
      typingNoteIdRef.current = id;
      const nextNotes = stickyNotesRef.current.map((n) => (n.id === id ? { ...n, content } : n));
      setStickyNotes(nextNotes);
      try {
        localStorage.setItem(storageNotesKey, JSON.stringify(nextNotes));
      } catch {}

      if (saveNoteTimeoutRef.current) {
        clearTimeout(saveNoteTimeoutRef.current);
      }
      saveNoteTimeoutRef.current = setTimeout(() => {
        if (roomCode) {
          syncUpdate({ canvasNotes: nextNotes }, "vừa cập nhật ghi chú");
        }
        typingNoteIdRef.current = null;
      }, 500);
    },
    [storageNotesKey, roomCode, syncUpdate]
  );

  const handleBlurStickyNote = useCallback(
    (id: string) => {
      if (saveNoteTimeoutRef.current) {
        clearTimeout(saveNoteTimeoutRef.current);
        saveNoteTimeoutRef.current = null;
      }
      typingNoteIdRef.current = null;
      if (roomCode) {
        syncUpdate({ canvasNotes: stickyNotesRef.current }, "vừa cập nhật ghi chú");
      }
    },
    [roomCode, syncUpdate]
  );

  const handleChangeNoteColor = useCallback(
    (id: string) => {
      const nextNotes = stickyNotesRef.current.map((n) => {
        if (n.id !== id) return n;
        const currentIdx = STICKY_NOTE_COLORS.findIndex((c) => c.color === n.color);
        const nextIdx = (currentIdx + 1) % STICKY_NOTE_COLORS.length;
        return { ...n, color: STICKY_NOTE_COLORS[nextIdx].color };
      });
      saveStickyNotes(nextNotes);
      if (roomCode) {
        syncUpdate({ canvasNotes: nextNotes }, "vừa đổi màu giấy note");
      }
    },
    [saveStickyNotes, roomCode, syncUpdate]
  );

  const handleDeleteStickyNote = useCallback(
    (id: string) => {
      const nextNotes = stickyNotesRef.current.filter((n) => n.id !== id);
      saveStickyNotes(nextNotes);
      if (roomCode) {
        syncUpdate({ canvasNotes: nextNotes }, "vừa gỡ một mẩu note");
      }
      setCustomPositions((prev) => {
        const copy = { ...prev };
        delete copy[id];
        try {
          localStorage.setItem(storagePosKey, JSON.stringify(copy));
        } catch {}
        return copy;
      });
    },
    [saveStickyNotes, roomCode, syncUpdate, storagePosKey]
  );


  /** Saves the new position of a dragged note (no-op for documents). */
  const moveStickyNote = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      if (!stickyNotesRef.current.some((n) => n.id === id)) return;
      const nextNotes = stickyNotesRef.current.map((n) =>
        n.id === id ? { ...n, x: pos.x, y: pos.y } : n,
      );
      saveStickyNotes(nextNotes);
      if (roomCode) syncUpdate({ canvasNotes: nextNotes });
    },
    [saveStickyNotes, roomCode, syncUpdate],
  );

  return {
    stickyNotes,
    typingNoteIdRef,
    moveStickyNote,
    handleAddStickyNote,
    handleUpdateStickyNote,
    handleBlurStickyNote,
    handleChangeNoteColor,
    handleDeleteStickyNote,
  };
}
