import { DeviceSimulatorClient } from "@/components/investigation/device-simulator-client";
import type { Device } from "@/lib/types";
import { normalizeCaseId } from "@/lib/cases/case-id";

/**
 * Trang thiết bị vật chứng: `/evidence/<id>?case_id=<slug>`.
 * Chỉ truyền id và case; chủ máy, nhãn, hình nền... PhoneSimulator lấy từ nạn nhân
 * của vụ án (`case_characters`, nạp theo `?case_id=` ở CaseCharactersProvider).
 */
export default async function DeviceSimulatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ case_id?: string; caseId?: string }>;
}) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const caseId = normalizeCaseId(sParams.case_id || sParams.caseId);

  const device: Device = {
    id,
    caseId,
    code: id.toUpperCase(),
    evidenceId: id.toUpperCase(),
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
  );
}
