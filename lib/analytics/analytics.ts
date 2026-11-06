import { logEvent, setUserProperties, setUserId } from "@firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/analytics/firebase";

// ==========================================
// 1. CORE EVENT TRACKING WRAPPER
// ==========================================

/**
 * Track custom user actions or game milestones
 * @param eventName Name of the event in snake_case
 * @param params Additional event parameters
 */
export async function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, params);
      if (process.env.NODE_ENV === "development") {
        console.log(`📊 [Analytics Event]: ${eventName}`, params);
      }
    }
  } catch (error) {
    console.error("Firebase Analytics trackEvent Error:", error);
  }
}

/**
 * Identify a user across sessions
 * @param userId Unique identifier for the user or detective session
 */
export async function identifyUser(userId: string) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      setUserId(analytics, userId);
    }
  } catch (error) {
    console.error("Firebase Analytics identifyUser Error:", error);
  }
}

/**
 * Set custom user dimensions / properties
 * @param properties Key-value attributes
 */
export async function updateUserProperties(properties: Record<string, any>) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      setUserProperties(analytics, properties);
    }
  } catch (error) {
    console.error("Firebase Analytics updateUserProperties Error:", error);
  }
}

// ==========================================
// 2. DOMAIN-SPECIFIC TYPED TRACKING HELPERS
// ==========================================

/**
 * Đo thời gian đọc hồ sơ tài liệu / PDF / lời khai
 */
export function trackDossierView(params: {
  docId: string;
  docTitle?: string;
  docType?: string;
  durationSeconds: number;
  caseId?: string;
}) {
  if (params.durationSeconds < 1) return; // Bỏ qua click nhầm < 1s
  trackEvent("dossier_viewed", {
    doc_id: params.docId,
    doc_title: params.docTitle || "unknown",
    doc_type: params.docType || "document",
    duration_seconds: params.durationSeconds,
    case_id: params.caseId || "case_000",
  });
}

/**
 * Đo thời gian soi ảnh phóng to / vật chứng
 */
export function trackPhotoInspected(params: {
  photoId: string;
  title?: string;
  durationSeconds: number;
  hasAnnotated?: boolean;
}) {
  if (params.durationSeconds < 1) return;
  trackEvent("evidence_photo_inspected", {
    photo_id: params.photoId,
    title: params.title || "evidence_photo",
    duration_seconds: params.durationSeconds,
    has_annotated: !!params.hasAnnotated,
  });
}

/**
 * Đo thời lượng sử dụng 1 App cụ thể trong Phone Simulator
 */
export function trackPhoneAppUsed(params: {
  appId: string;
  durationSeconds: number;
  caseId?: string;
}) {
  if (params.durationSeconds < 1) return;
  trackEvent("phone_app_used", {
    app_id: params.appId,
    duration_seconds: params.durationSeconds,
    case_id: params.caseId || "case_000",
  });
}

/**
 * Đo khi người chơi bấm xem gợi ý
 */
export function trackHintViewed(params: {
  checkpointId: string;
  hintTier: number; // 1, 2, 3
}) {
  trackEvent("hint_viewed", {
    checkpoint_id: params.checkpointId,
    hint_tier: params.hintTier,
  });
}

