'use client'

import React, { useState, useEffect } from 'react'
import { User, KeyRound, Briefcase, Upload, Loader2, Trash2, X } from 'lucide-react'
import { AdminDrawer } from '@/components/admin/admin-drawer'
import { uploadCharacterAvatar } from '@/lib/actions/character-actions'
import { toast } from '@/components/ui/toast'

export type CharacterData = {
  id: string
  name: string
  avatar?: string
  avatar_url?: string | null
  role: string
  occupation?: string
  relationship?: string
  quirks?: string
  motive?: string
  real_motive?: string
  secret?: string
  red_herring_secret?: string
  items?: string
  [key: string]: any
}

type CharacterPanelProps = {
  isOpen: boolean
  character: CharacterData | null
  onClose: () => void
  onSave?: (data: Partial<CharacterData>) => void
  onChangeField?: (field: string, value: any) => void
  onDelete?: (id: string) => void
}

export function CharacterPanel({ 
  isOpen, 
  character, 
  onClose, 
  onSave, 
  onChangeField,
  onDelete 
}: CharacterPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'secrets' | 'inventory'>('profile')
  const [isUploading, setIsUploading] = useState(false)

  // Local form state
  const [name, setName] = useState('')
  const [role, setRole] = useState('SUSPECT')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [occupation, setOccupation] = useState('')
  const [relationship, setRelationship] = useState('')
  const [quirks, setQuirks] = useState('')
  const [motive, setMotive] = useState('')
  const [secret, setSecret] = useState('')
  const [items, setItems] = useState('')

  // Sync local state whenever character prop changes
  useEffect(() => {
    if (character) {
      setName(character.name || '')
      setRole(character.role || 'SUSPECT')
      setAvatarUrl(character.avatar_url || (character.avatar && character.avatar.startsWith('http') ? character.avatar : null))
      setOccupation(character.occupation || '')
      setRelationship(character.relationship || '')
      setQuirks(character.quirks || '')
      setMotive(character.motive || character.real_motive || '')
      setSecret(character.secret || character.red_herring_secret || '')
      setItems(character.items || '')
    }
  }, [character])

  if (!character && isOpen) return null

  const handleFieldChange = (field: string, value: any) => {
    if (field === 'name') setName(value)
    if (field === 'role') setRole(value)
    if (field === 'avatar_url') setAvatarUrl(value)
    if (field === 'occupation') setOccupation(value)
    if (field === 'relationship') setRelationship(value)
    if (field === 'quirks') setQuirks(value)
    if (field === 'motive' || field === 'real_motive') setMotive(value)
    if (field === 'secret' || field === 'red_herring_secret') setSecret(value)
    if (field === 'items') setItems(value)

    if (onChangeField) {
      onChangeField(field, value)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadCharacterAvatar(formData)
      if (result.success && result.url) {
        handleFieldChange('avatar_url', result.url)
        toast.success('Tải ảnh đại diện nhân vật thành công!')
      } else {
        toast.error(result.error || 'Upload ảnh thất bại')
      }
    } catch (err: any) {
      toast.error('Đã xảy ra lỗi trong quá trình tải ảnh lên.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        name,
        role,
        avatar_url: avatarUrl,
        occupation,
        relationship,
        quirks,
        motive,
        real_motive: motive,
        secret,
        red_herring_secret: secret,
        items
      })
    }
  }

  return (
    <AdminDrawer
      isOpen={isOpen && !!character}
      onClose={onClose}
      title="Hồ Sơ Nhân Vật"
      className="top-14"
      footer={
        <>
          {onDelete && (
            <button 
              type="button"
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xoá nhân vật ${name || 'này'} khỏi vụ án? Hành động này sẽ xoá tất cả các sự kiện và mối quan hệ liên quan.`)) {
                  onDelete(character!.id)
                }
              }}
              className="px-3 py-2 text-xs font-medium border border-rose-500/30 hover:border-rose-500 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 rounded transition-colors"
            >
              Xóa nhân vật
            </button>
          )}
          <button 
            type="button"
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Lưu hồ sơ
          </button>
        </>
      }
    >
      {character && (
        <>
          {/* Quick Header Info with Avatar Upload */}
          <div className="p-4 -mx-4 -mt-4 mb-4 border-b border-white/5 flex items-start gap-4 bg-zinc-900/20">
            <div className="relative shrink-0 group/avatarContainer">
              <label className={`relative w-[70px] h-[90px] bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group/avatar transition-colors rounded-none ${
                avatarUrl ? 'border-0' : 'border border-white/10 hover:border-primary/50'
              }`}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={name} className="w-full h-full object-contain" />
                ) : (
                  <div className="flex items-center justify-center text-zinc-500 select-none">
                    <User className="size-6 stroke-[1.5]" aria-hidden="true" />
                  </div>
                )}
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <Upload className="size-5 text-white/80" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  disabled={isUploading}
                  className="hidden" 
                />
              </label>

              {/* Dấu X ở góc trên bên trái ảnh - Chỉ hiện khi hover */}
              {avatarUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleFieldChange('avatar_url', null)
                    toast.info('Đã gỡ ảnh đại diện nhân vật')
                  }}
                  className="absolute -top-2 -left-2 size-5 rounded-full bg-zinc-900 border border-white/20 hover:border-rose-500 text-zinc-400 hover:text-rose-400 opacity-0 group-hover/avatarContainer:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-20 cursor-pointer"
                  title="Gỡ ảnh đại diện"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                value={name} 
                onChange={e => handleFieldChange('name', e.target.value)}
                className="w-full bg-transparent text-base font-semibold text-zinc-100 focus:outline-none focus:border-b focus:border-primary truncate" 
                placeholder="Tên nhân vật..."
              />
              <select 
                value={role} 
                onChange={e => handleFieldChange('role', e.target.value)}
                className="mt-2 w-full bg-zinc-900 border border-white/10 rounded text-[10px] uppercase tracking-wider text-zinc-400 px-2 py-1 focus:outline-none focus:border-primary"
              >
                <option value="SUSPECT">Nghi phạm</option>
                <option value="VICTIM">Nạn nhân</option>
                <option value="KILLER">Hung thủ</option>
                <option value="WITNESS">Nhân chứng</option>
                <option value="DETECTIVE">Thám tử</option>
              </select>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex px-4 -mx-4 border-b border-white/5 mb-4">
            <button 
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <User className="size-3.5" /> Lý Lịch
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('secrets')}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'secrets' ? 'border-rose-500 text-rose-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <KeyRound className="size-3.5" /> Bí Mật
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <Briefcase className="size-3.5" /> Hành Lý
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Nghề nghiệp / Chức danh</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Bác sĩ, Thám tử, Nhà thực vật học" 
                    value={occupation} 
                    onChange={e => handleFieldChange('occupation', e.target.value)} 
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Mối quan hệ với nạn nhân</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Anh trai, Đồng nghiệp cũ, Người yêu cũ" 
                    value={relationship} 
                    onChange={e => handleFieldChange('relationship', e.target.value)} 
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Đặc điểm / Thói quen nhận dạng</label>
                  <textarea 
                    placeholder="Ví dụ: Thường gõ ngón tay khi nói dối, luôn mang theo bật lửa vàng" 
                    value={quirks} 
                    onChange={e => handleFieldChange('quirks', e.target.value)} 
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 h-20 focus:outline-none focus:border-primary resize-none" 
                  />
                </div>
              </div>
            )}

            {activeTab === 'secrets' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg">
                  <label className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1 block">Động cơ giết người ẩn giấu</label>
                  <textarea 
                    placeholder="Lý do thực sự khiến họ có thể muốn sát hại nạn nhân..." 
                    value={motive} 
                    onChange={e => handleFieldChange('motive', e.target.value)} 
                    className="w-full bg-zinc-950/50 border border-rose-900/30 rounded text-sm text-rose-100 px-3 py-2 h-20 focus:outline-none focus:border-rose-500 resize-none placeholder:text-rose-900/60" 
                  />
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Bí mật đen tối</label>
                  <textarea 
                    placeholder="Bí mật cá nhân họ muốn che giấu (khiến họ nói dối về ngoại phạm)..." 
                    value={secret} 
                    onChange={e => handleFieldChange('secret', e.target.value)} 
                    className="w-full bg-zinc-950/50 border border-white/10 rounded text-sm text-zinc-300 px-3 py-2 h-20 focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700" 
                  />
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 block">Vật dụng mang theo</label>
                  <p className="text-xs text-zinc-500 mb-2">Danh sách vật dụng nhân vật này mang theo (có thể thu thập làm bằng chứng).</p>
                  <textarea 
                    placeholder="- Chìa khóa phòng 302\n- Chài thuốc ngủ lọ 50ml" 
                    value={items} 
                    onChange={e => handleFieldChange('items', e.target.value)} 
                    className="w-full bg-zinc-900 border border-indigo-900/30 rounded text-sm text-indigo-100 px-3 py-2 h-32 focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs placeholder:text-zinc-700" 
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AdminDrawer>
  )
}
