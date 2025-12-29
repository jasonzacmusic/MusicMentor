import { createContext, useContext, useEffect, useState } from 'react'

type ColorMode = 'earth' | 'ocean' | 'cosmic' | 'dark' | 'light'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultColorMode?: ColorMode
  storageKey?: string
}

type ThemeProviderState = {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
}

const initialState: ThemeProviderState = {
  colorMode: 'earth',
  setColorMode: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const COLOR_MODES: { id: ColorMode; name: string; icon: string }[] = [
  { id: 'earth', name: 'Earth', icon: '🌍' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'cosmic', name: 'Cosmic', icon: '🌌' },
  { id: 'dark', name: 'Midnight', icon: '🌙' },
  { id: 'light', name: 'Light', icon: '☀️' },
]

export function ThemeProvider({
  children,
  defaultColorMode = 'earth',
  storageKey = 'music-mentor-color-mode',
  ...props
}: ThemeProviderProps) {
  const [colorMode, setColorMode] = useState<ColorMode>(
    () => (localStorage.getItem(storageKey) as ColorMode) || defaultColorMode
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'earth', 'ocean', 'cosmic')

    // Add the current color mode class
    root.classList.add(colorMode)
  }, [colorMode])

  const value = {
    colorMode,
    setColorMode: (newColorMode: ColorMode) => {
      localStorage.setItem(storageKey, newColorMode)
      setColorMode(newColorMode)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
