'use client'

import React, { useState } from 'react'
import { Save, Settings2, Bell, Shield, Users } from 'lucide-react'
import { DbAppSettings } from '@/lib/types/database'
import { updateAppSettings } from '@/lib/actions/settings-actions'
import { toast } from '@/components/ui/toast'

export function SettingsClient({ initialSettings }: { initialSettings: DbAppSettings }) {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<DbAppSettings>(initialSettings)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateAppSettings({
      maintenance_mode: settings.maintenance_mode,
      banner_active: settings.banner_active,
      banner_text: settings.banner_text
    })
    setIsSaving(false)
    if (res.success) {
      toast.success('Cập nhật cài đặt Studio thành công!')
    } else {
      toast.error('Lỗi khi cập nhật cài đặt: ' + res.error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Studio Settings</h1>
          <p className="text-zinc-400 mt-1">Manage global game rules, announcements, and team access.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
        >
          <Save className="size-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation / Sections */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-zinc-100 font-medium transition-colors text-sm text-left">
            <Settings2 className="size-4 text-primary" /> Global Rules
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 border border-transparent rounded-lg text-zinc-400 hover:text-zinc-100 font-medium transition-colors text-sm text-left">
            <Bell className="size-4" /> Announcements
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 border border-transparent rounded-lg text-zinc-400 hover:text-zinc-100 font-medium transition-colors text-sm text-left">
            <Shield className="size-4" /> Team & Access
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* SECTION: Global Rules */}
          <div className="bg-zinc-950/50 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="size-5 text-primary" />
              <h2 className="text-lg font-semibold text-zinc-100">Global Rules</h2>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-start justify-between p-4 bg-zinc-900/50 rounded-lg border border-white/5">
              <div>
                <h3 className="text-sm font-medium text-zinc-100">Maintenance Mode</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">Lock out all players from the game while you perform critical updates.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 border border-white/10"></div>
              </label>
            </div>
            {settings.maintenance_mode && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs font-medium">
                ⚠️ Maintenance mode is currently ON. Players cannot access the game.
              </div>
            )}
          </div>

          {/* SECTION: Announcements */}
          <div className="bg-zinc-950/50 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="size-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-zinc-100">Public Banner Announcement</h2>
            </div>
            
            <p className="text-xs text-zinc-400">Manage the yellow notification banner displayed at the top of the landing page and player dashboard.</p>

            {/* Enable Banner */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Enable Banner</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.banner_active}
                  onChange={(e) => setSettings({ ...settings, banner_active: e.target.checked })}
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 border border-white/10"></div>
              </label>
            </div>

            {/* Banner Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Banner Message</label>
              <textarea 
                rows={3}
                value={settings.banner_text}
                onChange={(e) => setSettings({ ...settings, banner_text: e.target.value })}
                disabled={!settings.banner_active}
                className="w-full bg-zinc-900 border border-white/10 rounded-md py-2.5 px-4 text-sm focus:outline-none focus:border-amber-500 transition-colors text-zinc-100 placeholder:text-zinc-600 resize-none disabled:opacity-50"
                placeholder="e.g. 🔥 Mật vụ mới đã ra mắt! Chơi ngay..."
              />
            </div>
          </div>

          {/* SECTION: Team Access */}
          <div className="bg-zinc-950/50 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Team & Access</h2>
            </div>
            
            <p className="text-xs text-zinc-400">Manage who has access to the Admin Studio.</p>

            <div className="border border-white/10 rounded-lg overflow-hidden bg-zinc-900/30">
              <div className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">A</div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">Admin Chief</div>
                    <div className="text-[10px] text-zinc-500">admin@dectproject.com</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider">Owner</span>
              </div>
            </div>

            {showInviteModal ? (
              <div className="p-4 bg-zinc-900 border border-indigo-500/30 rounded-lg space-y-3 animate-in fade-in duration-200">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Mời đồng tác giả mới</h4>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Nhập email đồng tác giả..."
                  className="w-full bg-zinc-950 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={() => {
                      if (!inviteEmail || !inviteEmail.includes('@')) {
                        toast.error('Vui lòng nhập địa chỉ Email hợp lệ.')
                        return
                      }
                      toast.success(`Đã gửi lời mời đồng tác giả tới: ${inviteEmail}`)
                      setInviteEmail('')
                      setShowInviteModal(false)
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
                  >
                    Gửi lời mời
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="w-full py-2 border border-dashed border-white/20 text-zinc-400 text-sm font-medium rounded hover:text-zinc-200 hover:border-white/40 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="size-4" /> Invite Co-Writer
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
