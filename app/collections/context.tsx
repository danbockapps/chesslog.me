'use client'

import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from 'react'

interface User {
  id: string
  email: string
}

interface AppContextType {
  user: User
  isDarkMode: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface ProviderProps {
  initialValue: User
}

export const AppContextProvider: FC<PropsWithChildren<ProviderProps>> = (props) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Changes when: system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <AppContext.Provider value={{user: props.initialValue, isDarkMode}}>
      {props.children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
