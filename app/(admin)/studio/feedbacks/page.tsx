import React from 'react'
import { getFeedbacks } from '@/lib/actions/feedback-actions'
import { FeedbacksClient } from './feedbacks-client'

export const dynamic = 'force-dynamic'

export default async function FeedbacksPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter = status || 'ALL'
  const { data } = await getFeedbacks(filter)

  return <FeedbacksClient initialFeedbacks={data || []} currentFilter={filter} />
}
