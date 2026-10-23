"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Smartphone,
  Grid,
  MessageSquare,
  Phone,
  Users,
  Image as ImageIcon,
  FolderOpen,
  RefreshCw,
  Eye,
  Edit3,
  Sliders,
  ChevronDown,
} from "lucide-react";
import type {
  DbCase,
  CaseCharacterDevice,
  DbCasePhoneApp,
  DbPhoneContact,
  DbPhoneCall,
  DbPhoneMessage,
  DbPhonePhoto,
  DbPhoneNote,
  DbPhoneBankTx,
  DbPhoneBrowserHistory,
  DbCaseCharacter,
} from "@/lib/types/database";
import type { Conversation, Photo } from "@/lib/types/phone";
import type { Document, BrowserHistory } from "@/lib/types";

// Editors
import { DeviceForm } from "./device-form";
import { AppLauncherEditor } from "./app-launcher-editor";
import { MessagesEditor } from "./messages-editor";
import { CallsEditor } from "./calls-editor";
import { ContactsEditor } from "./contacts-editor";
import { PhotosEditor } from "./photos-editor";
import { MiscEditors } from "./misc-editors";

// Live Preview Simulator
import { PhoneSimulator } from "@/components/phone-engine/phone-simulator";

interface PhoneStudioClientProps {
  initialCaseId: string;
  initialCases: DbCase[];
  initialDevice: CaseCharacterDevice;
  initialApps: DbCasePhoneApp[];
  initialContacts: DbPhoneContact[];
  initialCalls: DbPhoneCall[];
  initialMessages: DbPhoneMessage[];
  initialPhotos: DbPhonePhoto[];
  initialNotes: DbPhoneNote[];
  initialBankTxs: DbPhoneBankTx[];
  initialHistory: DbPhoneBrowserHistory[];
  initialCharacters: DbCaseCharacter[];
  checkpoints?: Array<{ checkpoint_id: string; title: string }>;
}

export function PhoneStudioClient({
  initialCaseId,
  initialCases,
  initialDevice,
  initialApps,
  initialContacts,
  initialCalls,
  initialMessages,
  initialPhotos,
  initialNotes,
  initialBankTxs,
  initialHistory,
  initialCharacters,
  checkpoints = [],
}: PhoneStudioClientProps) {
  const [caseId, setCaseId] = useState<string>(initialCaseId);
  const [activeTab, setActiveTab] = useState<
    "device" | "apps" | "messages" | "calls" | "contacts" | "photos" | "misc"
  >("device");

  // Mobile mode: "editor" or "preview"
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  // Local state for live preview reactivity
  const [device, setDevice] = useState<CaseCharacterDevice>(initialDevice);
  const [apps, setApps] = useState<DbCasePhoneApp[]>(initialApps);
  const [contacts, setContacts] = useState<DbPhoneContact[]>(initialContacts);
  const [calls, setCalls] = useState<DbPhoneCall[]>(initialCalls);
  const [messages, setMessages] = useState<DbPhoneMessage[]>(initialMessages);
  const [photos, setPhotos] = useState<DbPhonePhoto[]>(initialPhotos);
  const [notes, setNotes] = useState<DbPhoneNote[]>(initialNotes);
  const [bankTxs, setBankTxs] = useState<DbPhoneBankTx[]>(initialBankTxs);
  const [history, setHistory] =
    useState<DbPhoneBrowserHistory[]>(initialHistory);

  // Preview reload key to force remount simulator if needed
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Sync URL ?case=
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("case") !== caseId) {
      url.searchParams.set("case", caseId);
      window.history.replaceState({}, "", url.toString());
    }
  }, [caseId]);

  const activeCase = initialCases.find((c) => c.slug === caseId);

  // Transform data for PhoneSimulator WYSIWYG
  const previewThreads: Conversation[] = useMemo(() => {
    const threadMap = new Map<string, Conversation>();
    for (const msg of messages) {
      const key = msg.thread_key || "default";
      if (!threadMap.has(key)) {
        threadMap.set(key, {
          id: key,
          name: msg.thread_name || key,
          phoneNumber: msg.thread_phone || undefined,
          timestamp: msg.timestamp || "",
          previewText: msg.body,
          recoveryProgress: 100,
          unread: false,
          messages: [],
        });
      }
      const t = threadMap.get(key)!;
      t.messages.push({
        id: msg.id,
        sender: msg.sender,
        role: msg.role === "me" ? "sent" : "received",
        text: msg.body,
        timestamp: msg.timestamp || "",
        attachment: msg.attachment_url
          ? { type: "image", url: msg.attachment_url }
          : undefined,
        isClue: msg.is_clue,
        clueTitle: msg.clue_title || undefined,
        clueAnalysis: msg.clue_analysis || undefined,
      });
      t.previewText = msg.body;
      t.timestamp = msg.timestamp || t.timestamp;
    }
    return Array.from(threadMap.values());
  }, [messages]);

  const previewPhotos: Photo[] = useMemo(() => {
    return photos.map((p) => ({
      id: p.id,
      filename: p.label || p.photo_code || "photo.jpg",
      url: p.image_url,
      size: "2.4 MB",
      location:
        (p.exif_json && typeof p.exif_json.location === "string"
          ? p.exif_json.location
          : undefined) || "Hiện trường",
      status: "recovered",
      caption: p.description || p.label || "",
      timestamp: p.taken_at || "",
      isClue: p.is_evidence,
    }));
  }, [photos]);

  const previewNotes: Document[] = useMemo(() => {
    return notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.body,
      meta: n.code || "",
      damaged: n.is_pinned,
      timestamp: n.updated_at ? n.updated_at.slice(0, 10) : "",
    }));
  }, [notes]);

  const previewHistory: BrowserHistory[] = useMemo(() => {
    return history.map((h) => ({
      id: h.id,
      time: h.visited_at || "",
      label: h.title,
      status: "visited",
      url: h.url || undefined,
      isClue: h.is_clue,
    }));
  }, [history]);

  const previewDevice = useMemo(() => {
    return {
      id: "preview-phone",
      caseId: caseId,
      evidenceId: "DEV-VICTIM",
      label: device.label || "iPhone Nạn Nhân",
      kind: "phone" as const,
      owner: activeCase?.title || "Nạn nhân",
      locked: false,
      status: "unlocked" as const,
      recoveryLevel: 100,
      lastUpdated: new Date().toISOString(),
      chassis: device.chassis,
      wallpaper_url: device.wallpaper_url,
      selfie_url: device.selfie_url,
      passcode: device.passcode,
      status_bar: device.status_bar,
      lock_screen: device.lock_screen,
      settings_info: device.settings_info,
    };
  }, [device, caseId, activeCase]);

  // Statistics
  const totalClues =
    messages.filter((m) => m.is_clue).length +
    calls.filter((c) => c.is_key_clue).length +
    photos.filter((p) => p.is_evidence).length +
    bankTxs.filter((b) => b.is_clue).length +
    history.filter((h) => h.is_clue).length;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Header Bar */}
      <div className="h-14 px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Smartphone className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                Phone Studio
              </h1>
              <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                Multi-Case Engine
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Biên soạn thiết bị tang vật, ứng dụng iOS/Android và chứng cứ số
            </p>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden items-center gap-1 bg-zinc-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMobileView("editor")}
            className={`px-3 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
              mobileView === "editor"
                ? "bg-sky-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Edit3 className="size-3.5 inline mr-1" /> Biên tập
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`px-3 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
              mobileView === "preview"
                ? "bg-sky-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="size-3.5 inline mr-1" /> Xem trước
          </button>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* COLUMN 1: Case Picker & Overview Sidebar (w-64) */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-900/60 p-4 shrink-0 hidden md:flex flex-col space-y-5 overflow-y-auto">
          {/* Case Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <FolderOpen className="size-3.5 text-zinc-400" /> Vụ án đang chọn
            </label>
            <div className="relative">
              <select
                value={caseId}
                onChange={(e) => {
                  setCaseId(e.target.value);
                  window.location.search = `?case=${e.target.value}`;
                }}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-100 appearance-none focus:outline-none focus:border-sky-500 cursor-pointer pr-8"
              >
                {initialCases.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.slug}: {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {activeCase && (
              <div className="text-[11px] text-zinc-400 flex items-center justify-between px-1 pt-0.5">
                <span>Trạng thái:</span>
                <span className="font-mono text-emerald-400 uppercase">
                  {activeCase.status}
                </span>
              </div>
            )}
          </div>

          {/* Quick Statistics */}
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Tổng quan thiết bị
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Khung viền:</span>
                <span className="font-mono text-zinc-300">
                  {device.chassis || "iphone_classic"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ứng dụng:</span>
                <span className="font-bold text-sky-400 font-mono">
                  {apps.length} apps
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tin nhắn:</span>
                <span className="font-mono text-zinc-300">
                  {messages.length} msgs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cuộc gọi:</span>
                <span className="font-mono text-zinc-300">
                  {calls.length} cuộc
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Hình ảnh:</span>
                <span className="font-mono text-zinc-300">
                  {photos.length} ảnh
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800">
                <span className="text-amber-400 font-medium">Manh mối số:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {totalClues} mối
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tab Menu */}
          <div className="space-y-1 pt-1 flex-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
              Phân hệ biên soạn
            </span>

            <button
              type="button"
              onClick={() => setActiveTab("device")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "device"
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Sliders className="size-3.5" /> Thiết bị & Vỏ máy
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("apps")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "apps"
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Grid className="size-3.5" /> App Launcher ({apps.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "messages"
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <MessageSquare className="size-3.5" /> Tin nhắn ({messages.length}
              )
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calls")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "calls"
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Phone className="size-3.5" /> Cuộc gọi ({calls.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contacts")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "contacts"
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Users className="size-3.5" /> Danh bạ ({contacts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("photos")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "photos"
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <ImageIcon className="size-3.5" /> Album Ảnh ({photos.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("misc")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "misc"
                  ? "bg-sky-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Edit3 className="size-3.5" /> Ghi chú / Bank / Web
            </button>
          </div>
        </div>

        {/* COLUMN 2: Main Active Editor (flex-1) */}
        <div
          className={`flex-1 min-w-0 flex flex-col p-4 sm:p-6 overflow-y-auto ${
            mobileView === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeTab === "device" && (
            <DeviceForm
              caseId={caseId}
              initialDevice={device}
              onDeviceChange={(d) => setDevice(d)}
            />
          )}

          {activeTab === "apps" && (
            <AppLauncherEditor
              caseId={caseId}
              initialApps={apps}
              checkpoints={checkpoints}
              onAppsChange={(newApps) => setApps(newApps)}
            />
          )}

          {activeTab === "messages" && (
            <MessagesEditor
              caseId={caseId}
              initialMessages={messages}
              onMessagesChange={(newMsgs) => setMessages(newMsgs)}
            />
          )}

          {activeTab === "calls" && (
            <CallsEditor
              caseId={caseId}
              initialCalls={calls}
              onCallsChange={(newCalls) => setCalls(newCalls)}
            />
          )}

          {activeTab === "contacts" && (
            <ContactsEditor
              caseId={caseId}
              initialContacts={contacts}
              characters={initialCharacters}
              onContactsChange={(newContacts) => setContacts(newContacts)}
            />
          )}

          {activeTab === "photos" && (
            <PhotosEditor
              caseId={caseId}
              initialPhotos={photos}
              onPhotosChange={(newPhotos) => setPhotos(newPhotos)}
            />
          )}

          {activeTab === "misc" && (
            <MiscEditors
              caseId={caseId}
              initialNotes={notes}
              initialBankTxs={bankTxs}
              initialHistory={history}
              onNotesChange={(n) => setNotes(n)}
              onBankChange={(b) => setBankTxs(b)}
              onHistoryChange={(h) => setHistory(h)}
            />
          )}
        </div>

        {/* COLUMN 3: Live Preview Column (w-[440px]) */}
        <div
          className={`w-[440px] border-l border-zinc-800 bg-zinc-950/80 p-4 shrink-0 flex flex-col justify-start items-center overflow-hidden ${
            mobileView === "editor" ? "hidden lg:flex" : "flex w-full"
          }`}
        >
          {/* Preview Header Bar */}
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="size-3.5 text-sky-400" />
              <span className="text-xs font-semibold text-zinc-200">
                Mô phỏng Trực tiếp (Live Preview)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 cursor-pointer"
              title="Tải lại mô phỏng"
            >
              <RefreshCw className="size-3" />
            </button>
          </div>

          {/* Phone Canvas Container */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
            <div
              key={previewKey}
              className="w-full h-full flex items-center justify-center"
            >
              <PhoneSimulator
                device={previewDevice}
                threads={previewThreads}
                photos={previewPhotos}
                notes={previewNotes}
                history={previewHistory}
                frameless={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
