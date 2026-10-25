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
  const res = await getCaseBySlug(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  return <CaseDetailClient initialCase={res.data} />;
}
