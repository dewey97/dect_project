"use client";

import { useEffect, useEffectEvent } from "react";

export const INVESTIGATION_EVENTS = {
  OPEN_PHONE: "open-phone-modal",
  OPEN_HINT: "open-hint-modal",
  OPEN_EPILOGUE: "open-epilogue-modal",
  OPEN_REINVESTIGATE: "open-reinvestigate-modal",
  OPEN_GUIDE: "open-gameplay-guide-modal",
  OPEN_WALKTHROUGH: "open-interactive-walkthrough",
} as const;

export type InvestigationEventName =
  (typeof INVESTIGATION_EVENTS)[keyof typeof INVESTIGATION_EVENTS];
export type InvestigationEventKey = keyof typeof INVESTIGATION_EVENTS;
export type InvestigationEventInput =
  | InvestigationEventName
  | InvestigationEventKey;

function resolveEventName(event: InvestigationEventInput): InvestigationEventName {
  if (event in INVESTIGATION_EVENTS) {
    return INVESTIGATION_EVENTS[event as InvestigationEventKey];
  }
  return event as InvestigationEventName;
}

/**
 * Dispatch a typed investigation event across windows / components
 */
export function emitInvestigationEvent(
  event: InvestigationEventInput,
  detail?: unknown,
): void {
  if (typeof window === "undefined") return;
  const eventName = resolveEventName(event);
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Hook to subscribe to an investigation event with automatic cleanup on unmount
 */
export function useInvestigationEvent(
  event: InvestigationEventInput,
  callback: (e: CustomEvent) => void,
): void {
  const eventName = resolveEventName(event);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      callback(e as CustomEvent);
    };

    window.addEventListener(eventName, handler);
    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, [eventName, callback]);
}
