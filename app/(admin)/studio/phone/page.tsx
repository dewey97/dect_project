import type { Metadata } from "next";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { getCases } from "@/lib/actions/case-actions";
import {
  getPhoneApps,
  getPhoneContacts,
  getPhoneCalls,
  getPhoneMessages,
  getPhonePhotos,
  getPhoneNotes,
  getPhoneBankTransactions,
  getPhoneBrowserHistory,
} from "@/lib/actions/phone-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
import { getCheckpointsByCase } from "@/lib/actions/checkpoint-actions";
import { PhoneStudioClient } from "@/components/admin/phone-studio/phone-studio-client";
import type { CaseCharacterDevice } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Phone Studio | Detective Case System",
  description:
    "Biên soạn thiết bị tang vật điện thoại nạn nhân, ứng dụng iOS/Android và chứng cứ số",
};

export const dynamic = "force-dynamic";

export default async function PhoneStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const resolvedParams = await searchParams;
  const caseId = normalizeCaseId(resolvedParams.case || "case_000");

  const [
    casesRes,
    appsRes,
    contactsRes,
    callsRes,
    messagesRes,
    photosRes,
    notesRes,
    bankRes,
    historyRes,
    charactersRes,
    checkpointsRes,
  ] = await Promise.all([
    getCases(),
    getPhoneApps(caseId),
    getPhoneContacts(caseId),
    getPhoneCalls(caseId),
    getPhoneMessages(caseId),
    getPhonePhotos(caseId),
    getPhoneNotes(caseId),
    getPhoneBankTransactions(caseId),
    getPhoneBrowserHistory(caseId),
    getCharactersByCase(caseId),
    getCheckpointsByCase(caseId),
  ]);

  const characters = charactersRes.data || [];
  const victimChar =
    characters.find((c) => c.role === "victim") || characters[0];
  const device: CaseCharacterDevice =
    (victimChar?.device as CaseCharacterDevice) || {
      chassis: "iphone_classic",
      wallpaper_url: "/images/cases/case_000/phone/clean_beach_wallpaper.png",
      selfie_url: "/images/cases/case_000/phone/monkey_selfie.png",
      status_bar: {
        time: "21:30",
        battery: 15,
        service_text: "Không có Dịch vụ",
      },
      lock_screen: { time: "21:30", date: "Thứ Bảy, 23 tháng 7" },
      passcode: "120713",
      settings_info: {
        owner: victimChar?.name || "Nguyễn Văn Khang",
        model: "iPhone 6s Plus (64GB, Space Gray)",
        phone_number: "0904.888.666 (Viettel)",
        network_status: "Không có dịch vụ (No Service)",
        imei: "356984110294812",
        battery: "18%",
        security: "Touch ID",
      },
    };

  const checkpointsList = (checkpointsRes.data || []).map((cp) => ({
    checkpoint_id: cp.checkpoint_id,
    title: cp.title,
  }));

  return (
    <PhoneStudioClient
      initialCaseId={caseId}
      initialCases={casesRes.data || []}
      initialDevice={device}
      initialApps={appsRes.data || []}
      initialContacts={contactsRes.data || []}
      initialCalls={callsRes.data || []}
      initialMessages={messagesRes.data || []}
      initialPhotos={photosRes.data || []}
      initialNotes={notesRes.data || []}
      initialBankTxs={bankRes.data || []}
      initialHistory={historyRes.data || []}
      initialCharacters={characters}
      checkpoints={checkpointsList}
    />
  );
}
