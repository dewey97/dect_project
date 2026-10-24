"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

export interface EvidenceAnchor {
  id: string; // Mã vật chứng (vd: "CALL-01", "MSG-03", "NOTE-02", "BANK-04")
  top: number; // Tọa độ Y so với đỉnh màn hình điện thoại (pixel)
  height?: number; // Chiều cao dòng
  visible: boolean; // Có đang nằm trong viewport của màn hình điện thoại hay không
  label?: string; // Nhãn phụ (tuỳ chọn)
}

interface EvidenceAnchorContextType {
  anchors: Record<string, EvidenceAnchor>;
  registerAnchor: (anchor: EvidenceAnchor) => void;
  unregisterAnchor: (id: string) => void;
  updateAnchorPos: (id: string, top: number, visible: boolean) => void;
}

const EvidenceAnchorContext = createContext<EvidenceAnchorContextType | null>(
  null,
);

export function EvidenceAnchorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [anchors, setAnchors] = useState<Record<string, EvidenceAnchor>>({});

  const registerAnchor = useCallback((anchor: EvidenceAnchor) => {
    setAnchors((prev) => ({
      ...prev,
      [anchor.id]: anchor,
    }));
  }, []);

  const unregisterAnchor = useCallback((id: string) => {
    setAnchors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateAnchorPos = useCallback(
    (id: string, top: number, visible: boolean) => {
      setAnchors((prev) => {
        const curr = prev[id];
        if (curr && curr.top === top && curr.visible === visible) return prev;
        if (!curr) return prev;
        return {
          ...prev,
          [id]: {
            ...curr,
            top,
            visible,
          },
        };
      });
    },
    [],
  );

  return (
    <EvidenceAnchorContext.Provider
      value={{
        anchors,
        registerAnchor,
        unregisterAnchor,
        updateAnchorPos,
      }}
    >
      {children}
    </EvidenceAnchorContext.Provider>
  );
}

export function useEvidenceAnchors() {
  const ctx = useContext(EvidenceAnchorContext);
  return ctx;
}
