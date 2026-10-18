"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type {
  Device,
  Conversation,
  Photo,
  Document,
  BrowserHistory,
  RecoveredFile,
} from "@/lib/types";
import type { PhoneAppId } from "@/lib/types/phone";

export type ActivePhoneApp = PhoneAppId | "camera" | null;

export interface PhoneEngineContextType {
  device: Device;
  isLocked: boolean;
  activeApp: ActivePhoneApp;
  threads: Conversation[];
  photos: Photo[];
  notes: Document[];
  history: BrowserHistory[];
  files: RecoveredFile[];
  
  // Actions
  unlock: () => void;
  lock: () => void;
  openApp: (app: ActivePhoneApp) => void;
  goHome: () => void;
  closeSimulator?: () => void;
  
  // Forensic / Clue callbacks
  pinnedClueIds: Set<string>;
  togglePinClue: (clueId: string, metadata?: Record<string, unknown>) => void;
}

const PhoneEngineContext = createContext<PhoneEngineContextType | null>(null);

export interface PhoneProviderProps {
  device: Device;
  threads?: Conversation[];
  photos?: Photo[];
  notes?: Document[];
  history?: BrowserHistory[];
  files?: RecoveredFile[];
  initialLocked?: boolean;
  initialApp?: ActivePhoneApp;
  onClose?: () => void;
  onPinClue?: (clueId: string, metadata?: Record<string, unknown>) => void;
  children: React.ReactNode;
}

export function PhoneProvider({
  device,
  threads = [],
  photos = [],
  notes = [],
  history = [],
  files = [],
  initialLocked = false,
  initialApp = null,
  onClose,
  onPinClue,
  children,
}: PhoneProviderProps) {
  const [isLocked, setIsLocked] = useState<boolean>(initialLocked ?? device.locked ?? false);
  const [activeApp, setActiveApp] = useState<ActivePhoneApp>(initialApp);
  const [pinnedClueIds, setPinnedClueIds] = useState<Set<string>>(new Set());

  const unlock = useCallback(() => setIsLocked(false), []);
  const lock = useCallback(() => setIsLocked(true), []);
  const openApp = useCallback((app: ActivePhoneApp) => setActiveApp(app), []);
  const goHome = useCallback(() => setActiveApp(null), []);

  const togglePinClue = useCallback(
    (clueId: string, metadata?: Record<string, unknown>) => {
      setPinnedClueIds((prev) => {
        const next = new Set(prev);
        if (next.has(clueId)) {
          next.delete(clueId);
        } else {
          next.add(clueId);
        }
        return next;
      });
      if (onPinClue) {
        onPinClue(clueId, metadata);
      }
    },
    [onPinClue]
  );

  const value = useMemo<PhoneEngineContextType>(
    () => ({
      device,
      isLocked,
      activeApp,
      threads,
      photos,
      notes,
      history,
      files,
      unlock,
      lock,
      openApp,
      goHome,
      closeSimulator: onClose,
      pinnedClueIds,
      togglePinClue,
    }),
    [
      device,
      isLocked,
      activeApp,
      threads,
      photos,
      notes,
      history,
      files,
      unlock,
      lock,
      openApp,
      goHome,
      onClose,
      pinnedClueIds,
      togglePinClue,
    ]
  );

  return (
    <PhoneEngineContext.Provider value={value}>
      {children}
    </PhoneEngineContext.Provider>
  );
}

export function usePhone(): PhoneEngineContextType {
  const ctx = useContext(PhoneEngineContext);
  if (!ctx) {
    throw new Error("usePhone must be used within a PhoneProvider");
  }
  return ctx;
}
