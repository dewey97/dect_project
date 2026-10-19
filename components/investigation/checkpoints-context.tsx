'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getStorageJson, setStorageJson } from '@/lib/storage'
import { useRoomSync } from '@/components/investigation/room-sync-context'

interface CheckpointsContextType {
  completedCheckpointIds: string[]
  completeCheckpoint: (id: string) => void
  isCheckpointCompleted: (id: string) => boolean
  isDeviceLockedByCheckpoint: (caseId: string, deviceId: string) => boolean
  isConclusionUnlocked: (caseId: string) => boolean
}

const CheckpointsContext = createContext<CheckpointsContextType | undefined>(undefined)

export function CheckpointsProvider({ children }: { children: React.ReactNode }) {
  const [completedCheckpointIds, setCompletedCheckpointIds] = useState<string[]>([])
  const { roomCode, roomState, syncUpdate } = useRoomSync()

  // Load from storage in Solo mode
  useEffect(() => {
    if (!roomCode) {
      setCompletedCheckpointIds(getStorageJson<string[]>('completed_checkpoints', []))
    }
  }, [roomCode])

  // Sync with Room state when in group mode
  useEffect(() => {
    if (roomCode && roomState.completedCheckpoints) {
      setCompletedCheckpointIds((prev) => {
        const merged = Array.from(new Set([...prev, ...roomState.completedCheckpoints]))
        return merged
      })
    }
  }, [roomCode, roomState.completedCheckpoints])

  const completeCheckpoint = useCallback(
    (id: string) => {
      setCompletedCheckpointIds((prev) => {
        if (prev.includes(id)) return prev
        const next = [...prev, id]
        if (roomCode) {
          syncUpdate({ completedCheckpoints: next }, `đã giải xong một mục tiêu điều tra`)
        } else {
          setStorageJson('completed_checkpoints', next)
        }
        return next
      })
    },
    [roomCode, syncUpdate]
  )

  const isCheckpointCompleted = (id: string) => {
    return completedCheckpointIds.includes(id)
  }

  // Device locking rules based on checkpoints
  const isDeviceLockedByCheckpoint = (caseId: string, deviceId: string) => {
    if (caseId === 'case-01' || caseId === 'case-001') {
      // Laptop dev-02 requires cp-001-1 completed
      if (deviceId === 'dev-02') {
        return !isCheckpointCompleted('cp-001-1')
      }
      // Recorder dev-03 requires cp-001-2 completed
      if (deviceId === 'dev-03') {
        return !isCheckpointCompleted('cp-001-2')
      }
    }
    return false
  }

  // Conclusion unlocking rules based on checkpoints
  const isConclusionUnlocked = (caseId: string) => {
    if (caseId === 'case-000') {
      // Case 000 requires cp-000-2b or cp-000-2 completed to conclude
      return isCheckpointCompleted('cp-000-2b') || isCheckpointCompleted('cp-000-2')
    }
    // Case 001 does not strictly lock conclusion, or we can check if needed
    return true
  }

  return (
    <CheckpointsContext.Provider
      value={{
        completedCheckpointIds,
        completeCheckpoint,
        isCheckpointCompleted,
        isDeviceLockedByCheckpoint,
        isConclusionUnlocked
      }}
    >
      {children}
    </CheckpointsContext.Provider>
  )
}

export function useCheckpoints() {
  const context = useContext(CheckpointsContext)
  if (context === undefined) {
    throw new Error('useCheckpoints must be used within a CheckpointsProvider')
  }
  return context
}
