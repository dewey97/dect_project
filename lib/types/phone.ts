export type PhoneAppId =
  | "messages"
  | "phone"
  | "photos"
  | "notes"
  | "safari"
  | "maps"
  | "banking"
  | "voicemail"
  | "contacts"
  | "settings";

export type PhoneDeviceModel =
  | "iphone_classic"   // Viền dày, nút Home vật lý (ví dụ: iPhone 6s/7/8 - hợp các case bối cảnh quá khứ như 2016)
  | "iphone_modern"    // Viền mỏng, tai thỏ hoặc Dynamic Island
  | "android_vintage"; // Máy Android phổ thông

/** Profile cấu hình thiết bị di động trong vụ án */
export interface PhoneDeviceProfile {
  id: string;                      // vd: "dev_khang_01"
  caseId: string;                  // vd: "case_000"
  label: string;                   // vd: "iPhone 6s Plus (Vàng Hồng)"
  owner: string;                   // vd: "Nguyễn Văn Khang"
  model: PhoneDeviceModel;
  timeFreeze: string;              // Giờ hiển thị cố định ở status bar (vd: "17:55" hoặc "02:14")
  dateFreeze?: string;             // Ngày hiển thị ở màn hình khóa (vd: "Chủ Nhật, 24 tháng 7")
  batteryLevel?: number;           // vd: 14 (%)
  wallpaperUrl?: string;           // Ảnh nền cá nhân của nạn nhân / nghi phạm
  
  // Cơ chế giải mã / khóa
  isLocked: boolean;
  passcode?: string;               // Mã PIN mở khóa (vd: "2407" hoặc "1994")
  passcodeHint?: string;           // Gợi ý giải mã khi detective bị bế tắc
  recoveryLevel?: number;          // Tỷ lệ khôi phục dữ liệu forensic (0 - 100%)
  
  // Danh sách các App được kích hoạt trên máy này
  installedApps: PhoneAppId[];
  
  // Dữ liệu ban đầu (nếu có)
  initialApp?: PhoneAppId | null;
}

/** Base interface cho bất kỳ mục nào có thể đóng vai trò là Manh mối phá án */
export interface DigitalClueLink {
  isClue?: boolean;
  clueId?: string;                 // ID manh mối trên Bảng điều tra / Mindmap
  clueTitle?: string;              // Tên vắn tắt của chứng cứ
  clueAnalysis?: string;           // Nhận định nghiệp vụ điều tra
  leadsToCardId?: string;          // Node tương ứng trên Mindmap canvas
}

/** Message content in a thread */
export interface Message extends DigitalClueLink {
  id: string;
  sender: string;
  role: "sent" | "received" | "corrupted";
  text: string;
  timestamp: string;
  status?: string; // e.g. 'Đã xem 17:56', 'Chưa đọc', 'Đã gửi'
  attachment?: {
    type: "image" | "audio" | "video" | "location";
    title?: string;
    thumbnail?: string;
    url?: string;
    duration?: string;
    audioClue?: string;
  };
}

/** Conversation thread containing messages */
export interface Conversation extends DigitalClueLink {
  id: string;
  name: string;
  phoneNumber?: string;
  avatarColor?: string;
  avatarUrl?: string;
  timestamp: string;
  previewText: string;
  recoveryProgress: number;
  unread: boolean;
  isMuted?: boolean;
  messages: Message[];
}

/** Email model */
export interface Email extends DigitalClueLink {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  classification: "RESTRICTED" | "CONFIDENTIAL" | "UNCLASSIFIED";
  integrity: "SECURED" | "CORRUPTED" | "ANALYZING";
}

/** Photo details with EXIF metadata */
export interface Photo extends DigitalClueLink {
  id: string;
  filename: string;
  url?: string;
  size: string;
  location: string;
  status: "recovered" | "corrupted" | "encrypted";
  caption?: string;
  timestamp?: string;
  deviceModel?: string;            // EXIF: camera info
  exifCoords?: string;             // EXIF: GPS vĩ độ, kinh độ
}

/** Voice Recording audio details */
export interface VoiceRecording extends DigitalClueLink {
  id: string;
  title: string;
  duration: string;
  waveformPoints: number[];
  transcript: string;
  integrity: string;
  audioUrl?: string;
}

/** Call log history item */
export interface CallLogItem extends DigitalClueLink {
  id: string;
  contactName: string;
  phoneNumber: string;
  type: "incoming" | "outgoing" | "missed";
  timestamp: string;
  duration?: string;
  hasRecording?: boolean;
  recordingId?: string;
}

/** Banking transaction */
export interface BankingTransaction extends DigitalClueLink {
  id: string;
  amount: number;
  type: "in" | "out";
  senderOrReceiver: string;
  timestamp: string;
  description: string;
  balanceAfter?: number;
}

/** GPS location ping details */
export interface GPSLocation extends DigitalClueLink {
  id: string;
  timestamp: string;
  coordinates: string;
  accuracy: string;
  locationLabel: string;
}

/** Browser/Timeline History URL details */
export interface BrowserHistory extends DigitalClueLink {
  id: string;
  time: string;
  label: string;
  status: string;
  url?: string;
  redacted?: boolean;
}

