'use client'

import React, { useState } from 'react'
import { X, User, KeyRound, Briefcase } from 'lucide-react'

// Dummy type for now (will be replaced by DB schema later)
export type CharacterData = {
  id: string
  name: string
  avatar: string
  avatar_url?: string
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
  onDelete?: (id: string) => void
}

import { AdminDrawer } from '@/components/admin/admin-drawer'

export function CharacterPanel({ isOpen, character, onClose, onSave, onDelete }: CharacterPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'secrets' | 'inventory'>('profile')

  // Local form state
  const [name, setName] = useState(character?.name || '')
  const [role, setRole] = useState(character?.role || 'SUSPECT')
  const [occupation, setOccupation] = useState(character?.occupation || '')
  const [relationship, setRelationship] = useState(character?.relationship || '')
  const [quirks, setQuirks] = useState(character?.quirks || '')
  const [motive, setMotive] = useState(character?.motive || '')
  const [secret, setSecret] = useState(character?.secret || '')
  const [items, setItems] = useState(character?.items || '')

  if (!character && isOpen) return null

  const handleSave = () => {
    if (onSave) {
      onSave({
        name,
        role,
        occupation,
        relationship,
        quirks,
        motive,
        secret,
        items
      })
    }
  }

  const avatarUrl = character?.avatar_url || (character?.avatar && character.avatar.startsWith('http') ? character.avatar : null)

  return (
    <AdminDrawer
      isOpen={isOpen && !!character}
      onClose={onClose}
      title="Character Profile"
      className="top-14"
      footer={
        <>
          {onDelete && (
            <button 
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xoá nhân vật ${name || 'này'} khỏi vụ án? Hành động này sẽ xoá tất cả các sự kiện và mối quan hệ liên quan.`)) {
                  onDelete(character!.id)
                }
              }}
              className="px-3 py-2 text-xs font-medium border border-rose-500/30 hover:border-rose-500 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 rounded transition-colors"
            >
              Xóa
            </button>
          )}
          <button 
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Save Character
          </button>
        </>
      }
    >
      {character && (
        <>
          {/* Quick Header Info */}
          <div className="p-4 -mx-4 -mt-4 mb-4 border-b border-white/5 flex items-center gap-4 bg-zinc-900/20">
            <div className={`size-14 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 ${avatarUrl ? 'rounded-none border-0' : 'rounded-none border border-white/10'}`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className="w-full h-full object-contain" />
              ) : (
                <div className="flex items-center justify-center text-zinc-500 select-none">
                  <User className="size-6 stroke-[1.5]" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent text-base font-semibold text-zinc-100 focus:outline-none focus:border-b focus:border-primary truncate" 
                placeholder="Character Name"
              />
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)}
                className="mt-1 w-full bg-zinc-900 border border-white/10 rounded text-[10px] uppercase tracking-wider text-zinc-400 px-2 py-1 focus:outline-none focus:border-primary"
              >
                <option value="VICTIM">Victim</option>
                <option value="KILLER">Killer (Culprit)</option>
                <option value="SUSPECT">Suspect</option>
                <option value="WITNESS">Witness</option>
                <option value="DETECTIVE">Detective</option>
              </select>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex px-4 -mx-4 border-b border-white/5 mb-4">
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
          <div className="space-y-4">
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Occupation</label>
                  <input type="text" placeholder="e.g. Botanist, Detective" value={occupation} onChange={e => setOccupation(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Relationship to Victim</label>
                  <input type="text" placeholder="e.g. Brother, Ex-partner" value={relationship} onChange={e => setRelationship(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Quirks & Habits</label>
                  <textarea placeholder="e.g. Always taps fingers when lying" value={quirks} onChange={e => setQuirks(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 h-20 focus:outline-none focus:border-primary resize-none" />
                </div>
              </div>
            )}

            {activeTab === 'secrets' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg">
                  <label className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1 block">Hidden Motive</label>
                  <textarea placeholder="Why would they kill the victim?" value={motive} onChange={e => setMotive(e.target.value)} className="w-full bg-zinc-950/50 border border-rose-900/30 rounded text-sm text-rose-100 px-3 py-2 h-20 focus:outline-none focus:border-rose-500 resize-none placeholder:text-rose-900" />
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Dark Secret</label>
                  <textarea placeholder="A secret they are hiding (causes them to lie in alibi)" value={secret} onChange={e => setSecret(e.target.value)} className="w-full bg-zinc-950/50 border border-white/10 rounded text-sm text-zinc-300 px-3 py-2 h-20 focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700" />
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 block">Carried Items</label>
                  <p className="text-xs text-zinc-500 mb-2">Items this character has in their possession that might be found as evidence.</p>
                  <textarea placeholder="- Room Key\n- Sedatives" value={items} onChange={e => setItems(e.target.value)} className="w-full bg-zinc-900 border border-indigo-900/30 rounded text-sm text-indigo-100 px-3 py-2 h-32 focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs placeholder:text-zinc-700" />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AdminDrawer>
  )
}
