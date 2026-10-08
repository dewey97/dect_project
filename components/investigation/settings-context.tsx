'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import { getStorageItem, setStorageItem } from '@/lib/storage'

interface SettingsContextType {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  showTechDetails: boolean
  setLeftSidebarOpen: (val: boolean) => void
  setRightSidebarOpen: (val: boolean) => void
  setShowTechDetails: (val: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [showTechDetails, setShowTechDetails] = useState(false)

  // Load defaults from localStorage if available
  useEffect(() => {
    const savedLeft = getStorageItem('left_sidebar_open') ?? getStorageItem('leftSidebar')
    const savedRight = getStorageItem('right_sidebar_open') ?? getStorageItem('rightSidebar')

    if (savedLeft !== null) setLeftSidebarOpen(savedLeft === 'true')
    if (savedRight !== null) setRightSidebarOpen(savedRight === 'true')
  }, [])

  const handleSetLeft = (val: boolean) => {
    setLeftSidebarOpen(val)
    setStorageItem('left_sidebar_open', String(val))
  }

  const handleSetRight = (val: boolean) => {
    setRightSidebarOpen(val)
    setStorageItem('right_sidebar_open', String(val))
  }

  const handleSetTech = (val: boolean) => {
    setShowTechDetails(val)
    setStorageItem('tech_details_open', String(val))
  }

  return (
    <SettingsContext.Provider
      value={{
        leftSidebarOpen,
        rightSidebarOpen,
        showTechDetails,
        setLeftSidebarOpen: handleSetLeft,
        setRightSidebarOpen: handleSetRight,
        setShowTechDetails: handleSetTech,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
