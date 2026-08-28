import { getDashboardStats, getCases } from '@/lib/actions/case-actions'
import { DashboardClient } from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function AdminStudioDashboard() {
  // Fetch real data from Supabase
  const [statsRes, casesRes] = await Promise.all([
    getDashboardStats(),
    getCases()
  ])

  // Fallback defaults if DB fails or is empty
  const defaultStats = { totalPlayers: 0, totalCases: 0, activeSessions: 0 }
  
  return (
    <DashboardClient 
      stats={statsRes.success ? statsRes.data : defaultStats}
      cases={casesRes.success ? casesRes.data : []}
    />
  )
}
