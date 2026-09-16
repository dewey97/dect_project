'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'
import { CreateCaseButton } from './create-case-button'
import { DeleteCaseButton } from './delete-case-button'
import { DuplicateCaseButton } from './duplicate-case-button'
import { DbCase } from '@/lib/types/database'

export function CasesListClient({ initialCases }: { initialCases: DbCase[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredCases = useMemo(() => {
    return initialCases.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [initialCases, searchQuery, statusFilter])

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cases</h1>
          <p className="text-zinc-400 mt-1">Manage all your interactive mystery scenarios.</p>
        </div>
        <CreateCaseButton />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by title or ID..." 
            className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-zinc-100 placeholder:text-zinc-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-md py-2 px-3 text-sm text-zinc-300 focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-950/50 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/50 text-zinc-400 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Difficulty</th>
              <th className="px-6 py-4 font-medium">Last Updated</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No cases found matching your criteria.
                </td>
              </tr>
            ) : filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <Link href={`/studio/cases/${c.id}/overview`} className="font-medium text-zinc-100 hover:text-primary transition-colors block text-base">
                    {c.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-mono tracking-widest uppercase border ${
                    c.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    c.status === 'IN_REVIEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    c.status === 'ARCHIVED' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`size-1.5 rounded-full ${i < c.difficulty ? 'bg-zinc-300' : 'bg-zinc-800'}`} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  {new Date(c.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <DuplicateCaseButton caseId={c.id} />
                    <DeleteCaseButton caseId={c.id} caseTitle={c.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
