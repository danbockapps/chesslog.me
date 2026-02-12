'use client'

import {createContext, FC, PropsWithChildren, useContext} from 'react'

interface User {
  id: string
  email: string
}

interface AppContextType {
  user: User | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface ProviderProps {
  initialValue: User | null
}

export const AppContextProvider: FC<PropsWithChildren<ProviderProps>> = (props) => (
  <AppContext.Provider value={{user: props.initialValue}}>{props.children}</AppContext.Provider>
)

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
