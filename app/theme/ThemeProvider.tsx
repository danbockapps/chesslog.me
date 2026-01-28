'use client'

import {useEffect, useMemo} from 'react'
import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useMediaQuery from '@mui/material/useMediaQuery'
import {getTheme, themeColors} from './theme'

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const mode = prefersDark ? 'dark' : 'light'
  const theme = useMemo(() => getTheme(mode), [mode])

  // Changes when: user's system theme preference changes
  useEffect(() => {
    const colors = themeColors[mode]
    const root = document.documentElement

    // Inject CSS variables from theme.ts
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVarName, value)
    })
  }, [mode])

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
