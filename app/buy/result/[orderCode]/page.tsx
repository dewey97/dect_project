import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyResult } from "@/components/buy/buy-result";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kết quả thanh toán" };

/** PayOS returnUrl and cancelUrl both land here (PayOS appends its own query). */
export default async function BuyResultPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;
  if (!/^\d{1,15}$/.test(orderCode)) notFound();
  return <BuyResult orderCode={orderCode} />;
}
