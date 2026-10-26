import React from "react";
import { notFound } from "next/navigation";
import { getCaseBySlug } from "@/lib/actions/case-actions";
import { CaseDetailClient } from "./case-detail-client";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let res = await getCaseBySlug(slug);

  if (!res.success || !res.data) {
    // Chờ 800ms và thử lại 1 lần để chống lệch pha read-after-write trên Supabase Cloud
    await new Promise((resolve) => setTimeout(resolve, 800));
    res = await getCaseBySlug(slug);
  }

  if (!res.success || !res.data) {
    notFound();
  }

  return <CaseDetailClient initialCase={res.data} />;
}
