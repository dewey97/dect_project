'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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
  const [showTechDetails] = useState(false)

  // Load defaults from localStorage if available
  useEffect(() => {
    try {
      const savedLeft = localStorage.getItem('nocturne_leftSidebar')
      const savedRight = localStorage.getItem('nocturne_rightSidebar')

      if (savedLeft !== null) setLeftSidebarOpen(savedLeft === 'true')
      if (savedRight !== null) setRightSidebarOpen(savedRight === 'true')
    } catch {
      // localStorage not available (SSR)
    }
  }, [])

  const handleSetLeft = (val: boolean) => {
    setLeftSidebarOpen(val)
    try { localStorage.setItem('nocturne_leftSidebar', String(val)) } catch {}
  }

  const handleSetRight = (val: boolean) => {
    setRightSidebarOpen(val)
    try { localStorage.setItem('nocturne_rightSidebar', String(val)) } catch {}
  }

  const handleSetTech = (val: boolean) => {
    setShowTechDetails(val)
    try { localStorage.setItem('nocturne_techDetails', String(val)) } catch {}
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
