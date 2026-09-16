'use client'

import React from 'react'
import { Users, Activity, Target, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
        <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
          <Users className="size-3" />
          {payload[0].value.toLocaleString()} players
        </p>
      </div>
    )
  }
  return null
}

export function DashboardClient({ 
  stats, 
  cases 
}: { 
  stats: any, 
  cases: any[] 
}) {
  // Temporary mock data for the chart until we implement full timeseries in DB
  const playerEngagementData = [
    { name: 'Mon', players: Math.floor(stats.totalPlayers * 0.2) },
    { name: 'Tue', players: Math.floor(stats.totalPlayers * 0.4) },
    { name: 'Wed', players: Math.floor(stats.totalPlayers * 0.5) },
    { name: 'Thu', players: Math.floor(stats.totalPlayers * 0.6) },
    { name: 'Fri', players: Math.floor(stats.totalPlayers * 0.8) },
    { name: 'Sat', players: Math.floor(stats.totalPlayers * 1.1) },
    { name: 'Sun', players: stats.totalPlayers },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Analytics Dashboard</h1>
          <p className="text-zinc-400 mt-1">Track player engagement, completion rates, and case performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online (Live DB)
          </span>
        </div>
      </div>

      {/* 1. TOP METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Players', value: stats.totalPlayers.toLocaleString(), icon: Users, color: 'text-indigo-400', trend: 'Registered users' },
          { label: 'Active Sessions', value: stats.activeSessions.toLocaleString(), icon: Activity, color: 'text-emerald-400', trend: 'Live now', pulse: true },
          { label: 'Total Cases', value: stats.totalCases.toLocaleString(), icon: Target, color: 'text-amber-400', trend: 'In database' },
          { label: 'Total Playtime', value: '0 hrs', icon: Clock, color: 'text-blue-400', trend: 'Awaiting launch' },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-xl bg-zinc-900/40 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-zinc-800/50 ${stat.color}`}>
                <stat.icon className="size-5" />
              </div>
              {stat.pulse && (
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <p className="text-3xl font-semibold tracking-tight text-zinc-100">{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">{stat.label}</p>
            <p className="text-[10px] text-zinc-500 mt-3">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. PLAYER ENGAGEMENT CHART */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Player Engagement</h2>
              <p className="text-xs text-zinc-500 mt-1">Unique daily active users across all cases</p>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={playerEngagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="players" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPlayers)" activeDot={{ r: 6, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ALERTS */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-zinc-100">System Alerts</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-3">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-emerald-200">Database Connected</h4>
                <p className="text-[10px] text-emerald-400/80 mt-1">Supabase integration is fully operational.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CASE PERFORMANCE BOARD */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Case Performance</h2>
            <p className="text-xs text-zinc-500 mt-1">Real statistics from database</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50">
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Case Name</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    No cases found in database. Create one in the Cases tab.
                  </td>
                </tr>
              ) : (
                cases.slice(0, 5).map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-zinc-200">{c.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        c.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        c.status === 'IN_REVIEW' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{c.difficulty} / 5</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
