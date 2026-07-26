'use client'

import React, { useState } from 'react'
import { X, User, KeyRound, Briefcase } from 'lucide-react'

// Dummy type for now (will be replaced by DB schema later)
export type CharacterData = {
  id: string
  name: string
  avatar: string
  role: string
  // Additional fields we're introducing:
  occupation?: string
  relationship?: string
  quirks?: string
  motive?: string
  secret?: string
  items?: string
}

type CharacterPanelProps = {
  isOpen: boolean
  character: CharacterData | null
  onClose: () => void
  onSave?: (data: Partial<CharacterData>) => void
}

export function CharacterPanel({ isOpen, character, onClose, onSave }: CharacterPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'secrets' | 'inventory'>('profile')

  if (!character && isOpen) return null

  return (
    <div 
      className={`absolute top-14 bottom-0 right-0 w-[420px] z-[200] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {character && (
        <>
          {/* Header */}
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-zinc-900/40">
            <h3 className="font-medium text-sm text-zinc-100 flex items-center gap-2">
              Character Profile
            </h3>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {/* Quick Header Info */}
          <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-zinc-900/20">
            <div className="size-14 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xl font-semibold text-zinc-400 shrink-0">
              {character.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                defaultValue={character.name} 
                className="w-full bg-transparent text-base font-semibold text-zinc-100 focus:outline-none focus:border-b focus:border-primary truncate" 
                placeholder="Character Name"
              />
              <select 
                defaultValue={character.role} 
                className="mt-1 w-full bg-zinc-900 border border-white/10 rounded text-[10px] uppercase tracking-wider text-zinc-400 px-2 py-1 focus:outline-none focus:border-primary"
              >
                <option value="VICTIM">Victim</option>
                <option value="KILLER">Killer (Culprit)</option>
                <option value="SUSPECT">Suspect</option>
                <option value="WITNESS">Witness</option>
              </select>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex px-4 border-b border-white/5">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <User className="size-3.5" /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('secrets')}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'secrets' ? 'border-rose-500 text-rose-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <KeyRound className="size-3.5" /> Secrets
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <Briefcase className="size-3.5" /> Inventory
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800">
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Occupation</label>
                  <input type="text" placeholder="e.g. Botanist, Detective" defaultValue={character.occupation} className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Relationship to Victim</label>
                  <input type="text" placeholder="e.g. Brother, Ex-partner" defaultValue={character.relationship} className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Quirks & Habits</label>
                  <textarea placeholder="e.g. Always taps fingers when lying" defaultValue={character.quirks} className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 h-20 focus:outline-none focus:border-primary resize-none" />
                </div>
              </div>
            )}

            {activeTab === 'secrets' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg">
                  <label className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1 block">Hidden Motive</label>
                  <textarea placeholder="Why would they kill the victim?" defaultValue={character.motive} className="w-full bg-zinc-950/50 border border-rose-900/30 rounded text-sm text-rose-100 px-3 py-2 h-20 focus:outline-none focus:border-rose-500 resize-none placeholder:text-rose-900" />
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Dark Secret</label>
                  <textarea placeholder="A secret they are hiding (causes them to lie in alibi)" defaultValue={character.secret} className="w-full bg-zinc-950/50 border border-white/10 rounded text-sm text-zinc-300 px-3 py-2 h-20 focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700" />
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 block">Carried Items</label>
                  <p className="text-xs text-zinc-500 mb-2">Items this character has in their possession that might be found as evidence.</p>
                  <textarea placeholder="- Room Key\n- Sedatives" defaultValue={character.items} className="w-full bg-zinc-900 border border-indigo-900/30 rounded text-sm text-indigo-100 px-3 py-2 h-32 focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs placeholder:text-zinc-700" />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 flex justify-end shrink-0 bg-zinc-950">
            <button className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors w-full">
              Save Character
            </button>
          </div>
        </>
      )}
    </div>
  )
}
