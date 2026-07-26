import React from 'react'
import { Search, Filter, MoreHorizontal, User, ShieldAlert, Download, Activity, CheckCircle2 } from 'lucide-react'
import { getPlayers } from '@/lib/actions/player-actions'

export const dynamic = 'force-dynamic'

export default async function PlayersPage() {
  const { data: players } = await getPlayers()

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Players Database</h1>
          <p className="text-zinc-400 mt-1 flex items-center gap-2">
            <User className="size-4" /> {players?.length || 0} Registered Detectives
          </p>
        </div>
        <button suppressHydrationWarning className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 text-zinc-100 font-medium rounded-md hover:bg-zinc-800 transition-colors shadow-sm">
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input 
            suppressHydrationWarning
            type="text" 
            placeholder="Search players by name, email, or ID..." 
            className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
        <button suppressHydrationWarning className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors text-sm">
          <Filter className="size-4" />
          Filter Status
        </button>
      </div>

      {/* Players Table */}
      <div className="rounded-xl border border-white/10 bg-zinc-950/50 overflow-hidden shadow-2xl">
        <table className="w-full text-sm text-left">
          
          <thead className="bg-zinc-900/80 text-zinc-400 border-b border-white/10 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Player Profile</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Cases Solved</th>
              <th className="px-6 py-4">Joined At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-white/5">
            {(!players || players.length === 0) ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No players found in database.
                </td>
              </tr>
            ) : players.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                
                {/* Profile Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full flex items-center justify-center border border-white/10 font-bold tracking-tighter bg-emerald-500/20 text-emerald-400 uppercase">
                      {(p.display_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100">{p.display_name || 'Unknown User'}</div>
                      <div className="text-zinc-500 text-xs mt-0.5 font-mono">{p.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Activity className="size-3.5 text-emerald-500" />
                    <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-emerald-500">
                      ACTIVE
                    </span>
                  </div>
                </td>

                {/* Cases Solved Column */}
                <td className="px-6 py-4 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-zinc-600" />
                    <span className={p.play_sessions[0]?.count > 0 ? 'text-zinc-200' : 'text-zinc-600'}>
                      {p.play_sessions[0]?.count || 0}
                    </span>
                  </div>
                </td>

                {/* Joined At Column */}
                <td className="px-6 py-4 text-zinc-500 text-xs">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors group-hover:opacity-100 opacity-50">
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
