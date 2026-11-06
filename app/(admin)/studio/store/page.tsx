import { getStoreData } from "@/lib/actions/store-actions";
import { StoreClient } from "./store-client";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const result = await getStoreData();
  if (!result.success) {
    return (
      <p className="p-6 text-sm text-red-300">
        Không tải được dữ liệu cửa hàng: {result.error}
      </p>
    );
  }
  return <StoreClient data={result.data} />;
}
