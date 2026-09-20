/**
 * Evidence, Documents & Confiscated Devices types
 */

export type DeviceKind =
  "phone" | "laptop" | "tablet" | "drive" | "recorder" | "camera" | "gps";
export type DeviceStatus =
  "locked" | "unlocking" | "unlocked" | "analyzing" | "completed";
export type EvidenceKind =
  "message" | "email" | "voice" | "photo" | "gps" | "document" | "object";

/** A confiscated digital device the detective can unlock and explore. */
export interface EvidenceDevice {
  id: string;
  caseId: string;
  kind: DeviceKind;
  label: string;
  owner: string;
  locked: boolean;
  status: DeviceStatus;
  evidenceId: string;
  recoveryLevel: number;
  lastUpdated: string;
  thumbnail?: string;
  description?: string;
  previewStats?: string;
  pinLength?: number;
}

// Deprecated alias for legacy code compatibility
export type Device = EvidenceDevice;

/** A single piece of evidence found on a device. */
export interface Evidence {
  id: string;
  caseId: string;
  deviceId?: string;
  kind: EvidenceKind;
  title: string;
  preview: string;
  timestamp: string;
  flagged?: boolean;
  evidenceId: string;
  recoveredBy: string;
  integrityStatus: "secured" | "corrupted" | "analyzing";
  chainOfCustody: string;
  thumbnail?: string;
}

/** Document note details */
export interface Document {
  id: string;
  title: string;
  content: string;
  meta: string;
  damaged?: boolean;
  timestamp?: string;
}

/** Recovered binary/Zip/PDF file info */
export interface RecoveredFile {
  id: string;
  filename: string;
  kind: "pdf" | "zip" | "image" | "audio";
  size: string;
  status: "secured" | "corrupted" | "analyzing";
  integrity: string;
}
