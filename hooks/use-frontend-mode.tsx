"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type FrontendMode = "default" | "root"

interface FrontendModeContextType {
  mode: FrontendMode
  setMode: (mode: FrontendMode) => void
  toggleMode: () => void
}

const FrontendModeContext = createContext<FrontendModeContextType | undefined>(undefined)

export function FrontendModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<FrontendMode>("default")

  useEffect(() => {
    const savedMode = localStorage.getItem("frontend-mode") as FrontendMode | null
    if (savedMode) {
      setModeState(savedMode)
    }
  }, [])

  const setMode = (newMode: FrontendMode) => {
    setModeState(newMode)
    localStorage.setItem("frontend-mode", newMode)
  }

  const toggleMode = () => {
    const newMode = mode === "default" ? "root" : "default"
    setMode(newMode)
  }

  return (
    <FrontendModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </FrontendModeContext.Provider>
  )
}

export function useFrontendMode() {
  const context = useContext(FrontendModeContext)
  if (context === undefined) {
    throw new Error("useFrontendMode must be used within a FrontendModeProvider")
  }
  return context
}
