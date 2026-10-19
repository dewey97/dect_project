'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RoomInvestigationState, GameRoomRow, RoomMember, DetectivePing } from '@/lib/types/room'
import { DEFAULT_ROOM_STATE } from '@/lib/types/room'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface ToastNotice {
  id: string
  actorName: string
  actionText: string
  timestamp: number
}

interface RoomSyncContextType {
  roomCode: string | null
  nickname: string
  isConnected: boolean
  isConnecting: boolean
  roomState: RoomInvestigationState
  members: RoomMember[]
  memberCount: number
  activeToast: ToastNotice | null
  activePing: DetectivePing | null
  joinRoom: (code: string, customNick?: string) => Promise<{ success: boolean; error?: string }>
  leaveRoom: () => void
  syncUpdate: (patch: Partial<RoomInvestigationState>, actionText?: string) => Promise<void>
  broadcastPing: (
    targetId: string,
    label: string,
    coords?: { x: number; y: number },
    options?: {
      targetType?: 'pin' | 'doc' | 'evidence'
      docType?: 'pdf' | 'evidence'
      phase?: number
      page?: number
    }
  ) => void
  setNickname: (name: string) => void
}

const RoomSyncContext = createContext<RoomSyncContextType | undefined>(undefined)

const ROOM_CODE_STORAGE_KEY = 'dect_current_room_code'
const NICKNAME_STORAGE_KEY = 'dect_player_nickname'
const DEVICE_ID_KEY = 'dect_device_id'

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    return 'dev_' + Math.random().toString(36).slice(2, 10)
  }
}

export function RoomSyncProvider({ children }: { children: React.ReactNode }) {
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [nickname, setNicknameState] = useState<string>('Thám tử')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [roomState, setRoomState] = useState<RoomInvestigationState>(DEFAULT_ROOM_STATE)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [activeToast, setActiveToast] = useState<ToastNotice | null>(null)
  const [activePing, setActivePing] = useState<DetectivePing | null>(null)
  const activePingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const roomStateRef = useRef<RoomInvestigationState>(DEFAULT_ROOM_STATE)

  // Keep ref synchronized
  useEffect(() => {
    roomStateRef.current = roomState
  }, [roomState])

  const setNickname = useCallback((name: string) => {
    const clean = name.trim().slice(0, 30) || 'Thám tử'
    setNicknameState(clean)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(NICKNAME_STORAGE_KEY, clean)
      } catch {}
    }
    if (channelRef.current) {
      channelRef.current
        .track({
          nickname: clean,
          joinedAt: Date.now(),
        })
        .catch(() => {})
    }
  }, [])

  // Show auto-dismissing toast
  const triggerToast = useCallback((actorName: string, actionText: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40)
      } catch {}
    }
    const notice: ToastNotice = {
      id: Math.random().toString(36).slice(2),
      actorName,
      actionText,
      timestamp: Date.now(),
    }
    setActiveToast(notice)
    setTimeout(() => {
      setActiveToast((prev) => (prev?.id === notice.id ? null : prev))
    }, 4500)
  }, [])

  // Handle incoming or local ping
  const triggerPing = useCallback((ping: DetectivePing) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 30])
      } catch {}
    }
    if (activePingTimerRef.current) {
      clearTimeout(activePingTimerRef.current)
    }
    setActivePing(ping)
    activePingTimerRef.current = setTimeout(() => {
      setActivePing(null)
    }, 4500)
  }, [])

  // Broadcast ping to teammates
  const broadcastPing = useCallback(
    (
      targetId: string,
      label: string,
      coords?: { x: number; y: number },
      options?: {
        targetType?: 'pin' | 'doc' | 'evidence'
        docType?: 'pdf' | 'evidence'
        phase?: number
        page?: number
      }
    ) => {
      const ping: DetectivePing = {
        id: Math.random().toString(36).slice(2),
        actorName: nickname,
        targetId,
        label,
        coords,
        targetType: options?.targetType,
        docType: options?.docType,
        phase: options?.phase,
        page: options?.page,
        timestamp: Date.now(),
      }

      // Trigger locally immediately
      triggerPing(ping)

      // Broadcast over channel
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'DETECTIVE_PING',
          payload: ping,
        })
      }
    },
    [nickname, triggerPing]
  )

  // Leave room logic
  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setRoomCode(null)
    setIsConnected(false)
    setMembers([])
    setRoomState(DEFAULT_ROOM_STATE)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ROOM_CODE_STORAGE_KEY)
        const url = new URL(window.location.href)
        url.searchParams.delete('room')
        window.history.replaceState({}, '', url.toString())
      } catch {}
    }
  }, [supabase])

  // Join or create room
  const joinRoom = useCallback(
    async (code: string, customNick?: string): Promise<{ success: boolean; error?: string }> => {
      const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
      if (!cleanCode || cleanCode.length < 2) {
        return { success: false, error: 'Mã phòng phải có ít nhất 2 ký tự' }
      }

      setIsConnecting(true)

      const activeNick = customNick?.trim() || nickname
      if (customNick) {
        setNickname(activeNick)
      }

      try {
        // 1. Check or create row in Supabase
        const { data: existingRoom, error: fetchErr } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('room_code', cleanCode)
          .maybeSingle()

        if (fetchErr) {
          console.error('[RoomSync] Fetch error:', fetchErr)
        }

        let initialRoomState = DEFAULT_ROOM_STATE

        if (existingRoom) {
          initialRoomState = {
            ...DEFAULT_ROOM_STATE,
            ...(existingRoom.state_json || {}),
          }
        } else {
          // Create new room row
          const { error: insertErr } = await supabase.from('game_rooms').insert({
            room_code: cleanCode,
            game_id: 'case_000',
            state_json: DEFAULT_ROOM_STATE,
            last_action: `${activeNick} đã tạo phòng`,
          })

          if (insertErr) {
            console.error('[RoomSync] Insert error:', insertErr)
          }
        }

        setRoomState(initialRoomState)
        roomStateRef.current = initialRoomState
        setRoomCode(cleanCode)
        setIsConnected(true)

        // Save to storage & URL
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ROOM_CODE_STORAGE_KEY, cleanCode)
            const url = new URL(window.location.href)
            url.searchParams.set('room', cleanCode)
            window.history.replaceState({}, '', url.toString())
          } catch {}
        }

        // 2. Unsubscribe old channel if any
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }

        // 3. Subscribe to Realtime Channel with Presence tracking
        const deviceId = getDeviceId()
        const channel = supabase.channel(`room:${cleanCode}`, {
          config: {
            broadcast: { self: false },
            presence: { key: deviceId },
          },
        })

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState()
            const list: RoomMember[] = []
            Object.keys(state).forEach((key) => {
              const presences = state[key] as any[]
              if (presences && presences.length > 0) {
                const p = presences[0]
                list.push({
                  key,
                  nickname: p.nickname || 'Thám tử',
                  joinedAt: p.joinedAt || Date.now(),
                })
              }
            })
            list.sort((a, b) => a.joinedAt - b.joinedAt)
            setMembers(list)
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            const actor = (newPresences?.[0] as any)?.nickname
            if (actor && actor !== activeNick) {
              triggerToast(actor, 'vừa tham gia tổ chuyên án')
            }
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            const actor = (leftPresences?.[0] as any)?.nickname
            if (actor && actor !== activeNick) {
              triggerToast(actor, 'đã rời phòng')
            }
          })
          .on('broadcast', { event: 'DETECTIVE_PING' }, ({ payload }) => {
            if (!payload) return
            const ping = payload as DetectivePing
            triggerPing(ping)
            triggerToast(ping.actorName || 'Đồng đội', `đang chỉ vào: ${ping.label || 'manh mối'}`)
          })
          .on('broadcast', { event: 'STATE_PATCH' }, ({ payload }) => {
            if (!payload || !payload.patch) return
            const patch = payload.patch as Partial<RoomInvestigationState>
            const actor = payload.actorName || 'Đồng đội'
            const action = payload.actionText || 'đã cập nhật tiến trình'

            setRoomState((prev) => {
              const next = { ...prev, ...patch }
              // Merge arrays cleanly
              if (patch.completedCheckpoints) {
                next.completedCheckpoints = Array.from(
                  new Set([...prev.completedCheckpoints, ...patch.completedCheckpoints])
                )
              }
              if (patch.investigatedSuspects) {
                next.investigatedSuspects = Array.from(
                  new Set([...prev.investigatedSuspects, ...patch.investigatedSuspects])
                )
              }
              if (patch.solvedFollowups) {
                next.solvedFollowups = Array.from(
                  new Set([...prev.solvedFollowups, ...patch.solvedFollowups])
                )
              }
              if (patch.phoneInputs) {
                next.phoneInputs = { ...prev.phoneInputs, ...patch.phoneInputs }
              }
              if (patch.annotations) {
                next.annotations = {
                  ...(prev.annotations || {}),
                  ...patch.annotations,
                }
              }
              if (patch.teamNotes !== undefined) {
                next.teamNotes = patch.teamNotes
              }
              return next
            })

            triggerToast(actor, action)
          })
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'game_rooms',
              filter: `room_code=eq.${cleanCode}`,
            },
            (payload) => {
              const newRow = payload.new as GameRoomRow
              if (newRow?.state_json) {
                setRoomState((prev) => ({
                  ...prev,
                  ...newRow.state_json,
                  annotations: {
                    ...(prev.annotations || {}),
                    ...(newRow.state_json.annotations || {}),
                  },
                  teamNotes:
                    newRow.state_json.teamNotes !== undefined
                      ? newRow.state_json.teamNotes
                      : prev.teamNotes,
                }))
              }
            }
          )
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              try {
                await channel.track({
                  nickname: activeNick,
                  joinedAt: Date.now(),
                })
              } catch (trackErr) {
                console.warn('[RoomSync] Track error:', trackErr)
              }
            }
          })

        channelRef.current = channel
        return { success: true }
      } catch (err: any) {
        console.error('[RoomSync] Join room failed:', err)
        return { success: false, error: err?.message || 'Không thể kết nối phòng' }
      } finally {
        setIsConnecting(false)
      }
    },
    [nickname, setNickname, supabase, triggerToast]
  )

  // Broadcast & DB update
  const syncUpdate = useCallback(
    async (patch: Partial<RoomInvestigationState>, actionText?: string) => {
      if (!roomCode) return

      const currentState = roomStateRef.current
      const nextMerged: RoomInvestigationState = {
        ...currentState,
        ...patch,
      }

      // Merge arrays
      if (patch.completedCheckpoints) {
        nextMerged.completedCheckpoints = Array.from(
          new Set([...currentState.completedCheckpoints, ...patch.completedCheckpoints])
        )
      }
      if (patch.investigatedSuspects) {
        nextMerged.investigatedSuspects = Array.from(
          new Set([...currentState.investigatedSuspects, ...patch.investigatedSuspects])
        )
      }
      if (patch.solvedFollowups) {
        nextMerged.solvedFollowups = Array.from(
          new Set([...currentState.solvedFollowups, ...patch.solvedFollowups])
        )
      }
      if (patch.phoneInputs) {
        nextMerged.phoneInputs = {
          ...currentState.phoneInputs,
          ...patch.phoneInputs,
        }
      }
      if (patch.annotations) {
        nextMerged.annotations = {
          ...(currentState.annotations || {}),
          ...patch.annotations,
        }
      }
      if (patch.teamNotes !== undefined) {
        nextMerged.teamNotes = patch.teamNotes
      }

      setRoomState(nextMerged)
      roomStateRef.current = nextMerged

      const actionDesc = actionText || 'đã mở khóa manh mối'

      // 1. Broadcast immediately to peers (< 30ms)
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'STATE_PATCH',
          payload: {
            patch,
            actorName: nickname,
            actionText: actionDesc,
            timestamp: Date.now(),
          },
        })
      }

      // 2. Persist to Postgres
      try {
        await supabase
          .from('game_rooms')
          .update({
            state_json: nextMerged,
            last_action: `${nickname} ${actionDesc}`,
            updated_at: new Date().toISOString(),
          })
          .eq('room_code', roomCode)
      } catch (err) {
        console.error('[RoomSync] DB persist failed:', err)
      }
    },
    [nickname, roomCode, supabase]
  )

  // Catch-up on tab visibility change or reconnect
  useEffect(() => {
    if (!roomCode) return

    const handleCatchUp = async () => {
      if (document.visibilityState === 'visible' && roomCode) {
        try {
          const { data } = await supabase
            .from('game_rooms')
            .select('state_json')
            .eq('room_code', roomCode)
            .single()

          if (data?.state_json) {
            setRoomState((prev) => ({
              ...prev,
              ...data.state_json,
            }))
          }
        } catch {}
      }
    }

    document.addEventListener('visibilitychange', handleCatchUp)
    window.addEventListener('online', handleCatchUp)

    return () => {
      document.removeEventListener('visibilitychange', handleCatchUp)
      window.removeEventListener('online', handleCatchUp)
    }
  }, [roomCode, supabase])

  // Initial auto-connect from URL or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedNick = localStorage.getItem(NICKNAME_STORAGE_KEY)
      if (savedNick) {
        setNicknameState(savedNick)
      }

      const urlParams = new URLSearchParams(window.location.search)
      const urlRoom = urlParams.get('room')
      const savedRoom = localStorage.getItem(ROOM_CODE_STORAGE_KEY)

      const targetRoom = urlRoom || savedRoom
      if (targetRoom) {
        joinRoom(targetRoom, savedNick || undefined)
      }
    } catch {}
  }, [joinRoom])

  const memberCount = Math.max(isConnected ? 1 : 0, members.length)

  const contextValue = useMemo<RoomSyncContextType>(
    () => ({
      roomCode,
      nickname,
      isConnected,
      isConnecting,
      roomState,
      members,
      memberCount,
      activeToast,
      activePing,
      joinRoom,
      leaveRoom,
      syncUpdate,
      broadcastPing,
      setNickname,
    }),
    [
      roomCode,
      nickname,
      isConnected,
      isConnecting,
      roomState,
      members,
      memberCount,
      activeToast,
      activePing,
      joinRoom,
      leaveRoom,
      syncUpdate,
      broadcastPing,
      setNickname,
    ]
  )

  return (
    <RoomSyncContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification for Teammate Progress */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-[#1b140e]/95 border-2 border-amber-500/70 text-[#f5ebd9] px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm pointer-events-auto">
            <span className="text-xl">🕵️</span>
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold text-amber-400">{activeToast.actorName}</span>{' '}
              <span className="text-[#e8d5b5]">{activeToast.actionText}</span>
            </div>
          </div>
        </div>
      )}
    </RoomSyncContext.Provider>
  )
}

const DEFAULT_ROOM_SYNC_CONTEXT: RoomSyncContextType = {
  roomCode: null,
  nickname: 'Thám tử',
  isConnected: false,
  isConnecting: false,
  roomState: DEFAULT_ROOM_STATE,
  members: [],
  memberCount: 0,
  activeToast: null,
  activePing: null,
  joinRoom: async () => ({ success: false, error: 'No Room Provider' }),
  leaveRoom: () => {},
  syncUpdate: async () => {},
  broadcastPing: () => {},
  setNickname: () => {},
}

export function useRoomSync() {
  const context = useContext(RoomSyncContext)
  if (!context) {
    return DEFAULT_ROOM_SYNC_CONTEXT
  }
  return context
}
