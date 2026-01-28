import {createTheme, ThemeOptions} from '@mui/material/styles'

// Single source of truth for all colors
export const themeColors = {
  light: {
    background: '#fafafa',
    surface: '#ffffff',
    surfaceHover: '#f5f5f5',
    primary: '#1976d2',
    primaryHover: '#1565c0',
    secondary: '#9c27b0',
    textPrimary: '#1f2937', // gray-800
    textSecondary: '#6b7280', // gray-500
    textMuted: '#9ca3af', // gray-400
    border: '#d1d5db', // gray-300
    borderLight: '#e5e7eb', // gray-200
    success: '#22c55e', // green-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    info: '#3b82f6', // blue-500
    // Brand colors (always same regardless of mode)
    chesscom: '#2d2c28',
    lichess: '#000000',
  },
  dark: {
    background: '#111827', // gray-900
    surface: '#1f2937', // gray-800
    surfaceHover: '#374151', // gray-700
    primary: '#3b82f6', // blue-500
    primaryHover: '#2563eb', // blue-600
    secondary: '#a855f7', // purple-500
    textPrimary: '#f9fafb', // gray-50
    textSecondary: '#9ca3af', // gray-400
    textMuted: '#6b7280', // gray-500
    border: '#4b5563', // gray-600
    borderLight: '#374151', // gray-700
    success: '#22c55e', // green-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    info: '#3b82f6', // blue-500
    // Brand colors (always same regardless of mode)
    chesscom: '#2d2c28',
    lichess: '#000000',
  },
}

const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: themeColors.light.primary,
    },
    secondary: {
      main: themeColors.light.secondary,
    },
    success: {
      main: themeColors.light.success,
    },
    error: {
      main: themeColors.light.error,
    },
    warning: {
      main: themeColors.light.warning,
    },
    info: {
      main: themeColors.light.info,
    },
    background: {
      default: themeColors.light.background,
      paper: themeColors.light.surface,
    },
    text: {
      primary: themeColors.light.textPrimary,
      secondary: themeColors.light.textSecondary,
    },
  },
}

const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: themeColors.dark.primary,
    },
    secondary: {
      main: themeColors.dark.secondary,
    },
    success: {
      main: themeColors.dark.success,
    },
    error: {
      main: themeColors.dark.error,
    },
    warning: {
      main: themeColors.dark.warning,
    },
    info: {
      main: themeColors.dark.info,
    },
    background: {
      default: themeColors.dark.background,
      paper: themeColors.dark.surface,
    },
    text: {
      primary: themeColors.dark.textPrimary,
      secondary: themeColors.dark.textSecondary,
    },
  },
}

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme(mode === 'light' ? lightTheme : darkTheme)
}
