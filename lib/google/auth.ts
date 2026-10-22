import { google } from "googleapis";
import fs from "fs";
import path from "path";

/**
 * Tạo GoogleAuth cho service account.
 * Ưu tiên `GOOGLE_SERVICE_ACCOUNT_JSON` (inline), sau đó file
 * `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` (mặc định `google-service-account.json`).
 * Trả về null khi không có cấu hình, không fallback sang ADC.
 */
export function createGoogleAuth(
  scope: string,
): InstanceType<typeof google.auth.GoogleAuth> | null {
  const inlineCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineCredentials) {
    try {
      return new google.auth.GoogleAuth({
        credentials: JSON.parse(inlineCredentials),
        scopes: [scope],
      });
    } catch (e) {
      console.error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON format:", e);
    }
  }

  const keyPath = path.resolve(
    process.cwd(),
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || "google-service-account.json",
  );
  if (fs.existsSync(keyPath)) {
    return new google.auth.GoogleAuth({ keyFile: keyPath, scopes: [scope] });
  }

  return null;
}
