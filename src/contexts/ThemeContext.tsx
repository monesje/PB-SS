import React, { createContext, useContext, useState } from 'react'
import type { ThemeTier } from '../types'

interface ThemeContextType {
  tier: ThemeTier
  setTier: (tier: ThemeTier) => void
  getThemeColors: () => {
    primary: string
    secondary: string
    accent: string
    background: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const themeColors = {
  small: {
    primary: 'teal-600',
    secondary: 'teal-100',
    accent: 'teal-500',
    background: 'teal-50'
  },
  medium: {
    primary: 'purple-600',
    secondary: 'purple-100',
    accent: 'purple-500',
    background: 'purple-50'
  },
  large: {
    primary: 'gold-600',
    secondary: 'gold-100',
    accent: 'gold-500',
    background: 'gold-50'
  },
  commercial: {
    primary: 'red-600',
    secondary: 'red-100',
    accent: 'red-500',
    background: 'red-50'
  },
  public: {
    primary: 'gray-600',
    secondary: 'gray-100',
    accent: 'gray-500',
    background: 'gray-50'
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<ThemeTier>('public')

  const getThemeColors = () => {
    return themeColors[tier]
  }

  const value = {
    tier,
    setTier,
    getThemeColors
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}