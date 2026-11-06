import { getStoreData } from "@/lib/actions/store-actions";
import { getStudioCaseId } from "@/lib/studio/active-case";
import { StoreClient } from "./store-client";

export const dynamic = "force-dynamic";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const [result, caseId] = await Promise.all([
    getStoreData(),
    searchParams.then((sp) => getStudioCaseId(sp.case)),
  ]);
  if (!result.success) {
    return (
      <p className="p-6 text-sm text-red-300">
        Không tải được dữ liệu cửa hàng: {result.error}
      </p>
    );
  }
  return <StoreClient key={caseId} data={result.data} caseId={caseId} />;
}
