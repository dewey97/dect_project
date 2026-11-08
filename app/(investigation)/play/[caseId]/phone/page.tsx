import { notFound } from "next/navigation";
import { DeviceSimulatorClient } from "@/components/investigation/device-simulator-client";
import type { Device } from "@/lib/types";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { serverAllowsPlay } from "@/lib/payments/ownership";
import { CaseAccessGuard } from "@/components/store/case-access-guard";

export const dynamic = "force-dynamic";

/**
 * Điện thoại nạn nhân: `/play/<case_id>/phone`.
 * Chỉ truyền id và case; chủ máy, nhãn, hình nền... PhoneSimulator lấy từ nạn nhân
 * của vụ án (`case_characters`, nạp theo case trên path ở CaseCharactersProvider).
 */
export default async function PhonePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const [{ caseId: raw }, query] = await Promise.all([params, searchParams]);
  if (!isValidCaseId(raw)) notFound();
  const caseId = normalizeCaseId(raw);
  const allowed = await serverAllowsPlay(caseId, query.room);

  const device: Device = {
    id: "victim-phone",
    caseId,
    code: "VICTIM-PHONE",
    evidenceId: "VICTIM-PHONE",
    label: "Điện thoại nạn nhân",
    kind: "phone",
    owner: "",
    locked: false,
    status: "unlocked",
    recoveryLevel: 100,
    lastUpdated: "",
    description: "",
  };

  return (
    <CaseAccessGuard caseId={caseId} allowed={allowed}>
      <DeviceSimulatorClient
        caseId={caseId}
        device={device}
        threads={[]}
        photos={[]}
        emails={[]}
        notes={[]}
        history={[]}
        files={[]}
      />
    </CaseAccessGuard>
  );
}
