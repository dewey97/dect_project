/**
 * Phone & Digital Evidence data types
 * Covers Messages, Emails, Photos, Voice recordings, GPS, Browser history
 */

/** Message content in a thread */
export interface Message {
  id: string;
  sender: string;
  role: "sent" | "received" | "corrupted";
  text: string;
  timestamp: string;
  status?: string; // e.g. 'Đã xem 17:56', 'Chưa đọc', 'Đã gửi'
  attachment?: {
    type: "image" | "audio" | "location";
    title?: string;
    thumbnail?: string;
    url?: string;
    duration?: string;
    audioClue?: string;
  };
  isClue?: boolean;
  clueTitle?: string;
  clueAnalysis?: string;
}

/** Conversation thread containing messages */
export interface Conversation {
  id: string;
  name: string;
  phoneNumber?: string;
  avatarColor?: string;
  timestamp: string;
  previewText: string;
  recoveryProgress: number;
  unread: boolean;
  isMuted?: boolean;
  messages: Message[];
}

/** Email model */
export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  classification: "RESTRICTED" | "CONFIDENTIAL" | "UNCLASSIFIED";
  integrity: "SECURED" | "CORRUPTED" | "ANALYZING";
}

/** Photo details */
export interface Photo {
  id: string;
  filename: string;
  size: string;
  location: string;
  status: "recovered" | "corrupted" | "encrypted";
  caption?: string;
  timestamp?: string;
}

/** Voice Recording audio details */
export interface VoiceRecording {
  id: string;
  title: string;
  duration: string;
  waveformPoints: number[];
  transcript: string;
  integrity: string;
}

/** GPS location ping details */
export interface GPSLocation {
  id: string;
  timestamp: string;
  coordinates: string;
  accuracy: string;
  locationLabel: string;
}

/** Browser/Timeline History URL details */
export interface BrowserHistory {
  id: string;
  time: string;
  label: string;
  status: string;
  redacted?: boolean;
}
