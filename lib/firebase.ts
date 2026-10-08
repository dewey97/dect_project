import { initializeApp, getApps, getApp, type FirebaseApp } from "@firebase/app";
import { getAnalytics, isSupported, type Analytics } from "@firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAj0SUr0tQDYXmHVThbRtp9gTGobZtB_sY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "lrp-dectective.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lrp-dectective",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "lrp-dectective.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "886065470734",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:886065470734:web:4757142564da3950cc8b5f",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MJNW2MDLND"
};

let firebaseAppInstance: FirebaseApp | null = null;
let analyticsInstance: Analytics | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey) return null;

  try {
    if (!firebaseAppInstance) {
      firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    return firebaseAppInstance;
  } catch {
    return null;
  }
}

/**
 * Get Firebase Analytics instance safely in client-side environment
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;

  try {
    const app = getFirebaseApp();
    if (!app) return null;

    if (!analyticsInstance) {
      const supported = await isSupported().catch(() => false);
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    }
    return analyticsInstance;
  } catch {
    return null;
  }
}
