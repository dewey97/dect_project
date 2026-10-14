"use client";

import { useState, useCallback, useMemo } from "react";
import type { PhoneAppId, PhoneDeviceProfile } from "@/lib/types/phone";

export interface PhoneEngineState {
  // Device metadata
  profile: PhoneDeviceProfile;
  
  // Lock screen / Passcode
  isLocked: boolean;
  passcodeAttempt: string;
  isPasscodeError: boolean;
  
  // Navigation
  activeApp: PhoneAppId | null;
  appHistory: PhoneAppId[];
  
  // Inspection / Clue interaction
  pinnedClueIds: Set<string>;
}

export interface UsePhoneEngineReturn extends PhoneEngineState {
  // Passcode actions
  enterDigit: (digit: string) => void;
  deleteDigit: () => void;
  clearPasscode: () => void;
  unlockWithPasscode: () => boolean;
  lockDevice: () => void;
  
  // Navigation actions
  openApp: (appId: PhoneAppId) => void;
  goHome: () => void;
  goBack: () => void;
  
  // Clue actions
  togglePinClue: (clueId: string) => void;
  isCluePinned: (clueId: string) => boolean;
}

const DEFAULT_PROFILE: PhoneDeviceProfile = {
  id: "dev_default_01",
  caseId: "case_000",
  label: "iPhone 6s Plus (Vàng Hồng)",
  owner: "Nguyễn Văn Khang",
  model: "iphone_classic",
  timeFreeze: "17:55",
  dateFreeze: "Chủ Nhật, 24 tháng 7",
  batteryLevel: 14,
  isLocked: false,
  installedApps: [
    "messages",
    "phone",
    "photos",
    "notes",
    "safari",
    "maps",
    "banking",
    "voicemail",
    "contacts",
    "settings",
  ],
};

export function usePhoneEngine(
  customProfile?: Partial<PhoneDeviceProfile>,
  onClueDiscovered?: (clueId: string) => void
): UsePhoneEngineReturn {
  const profile = useMemo<PhoneDeviceProfile>(() => {
    return {
      ...DEFAULT_PROFILE,
      ...customProfile,
      installedApps: customProfile?.installedApps || DEFAULT_PROFILE.installedApps,
    };
  }, [customProfile]);

  const [isLocked, setIsLocked] = useState<boolean>(profile.isLocked);
  const [passcodeAttempt, setPasscodeAttempt] = useState<string>("");
  const [isPasscodeError, setIsPasscodeError] = useState<boolean>(false);

  const [activeApp, setActiveApp] = useState<PhoneAppId | null>(
    profile.initialApp || null
  );
  const [appHistory, setAppHistory] = useState<PhoneAppId[]>([]);
  const [pinnedClueIds, setPinnedClueIds] = useState<Set<string>>(new Set());

  // Passcode Handlers
  const enterDigit = useCallback(
    (digit: string) => {
      if (passcodeAttempt.length >= 6) return;
      const nextAttempt = passcodeAttempt + digit;
      setPasscodeAttempt(nextAttempt);
      setIsPasscodeError(false);

      // Auto-validate if reaching required length
      const targetPass = profile.passcode || "";
      if (targetPass && nextAttempt.length === targetPass.length) {
        if (nextAttempt === targetPass) {
          setIsLocked(false);
          setPasscodeAttempt("");
        } else {
          setIsPasscodeError(true);
          setTimeout(() => {
            setPasscodeAttempt("");
            setIsPasscodeError(false);
          }, 600);
        }
      }
    },
    [passcodeAttempt, profile.passcode]
  );

  const deleteDigit = useCallback(() => {
    setPasscodeAttempt((prev) => prev.slice(0, -1));
    setIsPasscodeError(false);
  }, []);

  const clearPasscode = useCallback(() => {
    setPasscodeAttempt("");
    setIsPasscodeError(false);
  }, []);

  const unlockWithPasscode = useCallback(() => {
    if (!profile.passcode || passcodeAttempt === profile.passcode) {
      setIsLocked(false);
      setPasscodeAttempt("");
      setIsPasscodeError(false);
      return true;
    }
    setIsPasscodeError(true);
    return false;
  }, [passcodeAttempt, profile.passcode]);

  const lockDevice = useCallback(() => {
    setIsLocked(true);
    setActiveApp(null);
    setAppHistory([]);
    setPasscodeAttempt("");
  }, []);

  // Navigation Handlers
  const openApp = useCallback((appId: PhoneAppId) => {
    setActiveApp((prev) => {
      if (prev && prev !== appId) {
        setAppHistory((hist) => [...hist, prev]);
      }
      return appId;
    });
  }, []);

  const goHome = useCallback(() => {
    setActiveApp(null);
    setAppHistory([]);
  }, []);

  const goBack = useCallback(() => {
    setAppHistory((prevHist) => {
      if (prevHist.length === 0) {
        setActiveApp(null);
        return [];
      }
      const nextHist = [...prevHist];
      const previousApp = nextHist.pop();
      setActiveApp(previousApp || null);
      return nextHist;
    });
  }, []);

  // Clue Pinned Handlers
  const togglePinClue = useCallback(
    (clueId: string) => {
      setPinnedClueIds((prev) => {
        const next = new Set(prev);
        if (next.has(clueId)) {
          next.delete(clueId);
        } else {
          next.add(clueId);
          onClueDiscovered?.(clueId);
        }
        return next;
      });
    },
    [onClueDiscovered]
  );

  const isCluePinned = useCallback(
    (clueId: string) => {
      return pinnedClueIds.has(clueId);
    },
    [pinnedClueIds]
  );

  return {
    profile,
    isLocked,
    passcodeAttempt,
    isPasscodeError,
    activeApp,
    appHistory,
    pinnedClueIds,
    enterDigit,
    deleteDigit,
    clearPasscode,
    unlockWithPasscode,
    lockDevice,
    openApp,
    goHome,
    goBack,
    togglePinClue,
    isCluePinned,
  };
}
