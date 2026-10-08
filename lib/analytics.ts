import { logEvent, setUserProperties, setUserId } from "@firebase/analytics";
import { getFirebaseAnalytics } from "./firebase";

/**
 * Track custom user actions or game milestones
 * @param eventName Name of the event in snake_case (e.g., 'clue_opened', 'checkpoint_solved')
 * @param params Additional event parameters (e.g., { clue_id: 'DOC-01', phase: 1 })
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
 * @param properties Key-value attributes (e.g., { role: 'investigator', tier: 'premium' })
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
