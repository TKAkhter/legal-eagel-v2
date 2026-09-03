import { createTheme, type ThemeOptions } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'
export type ThemeDirection = 'ltr' | 'rtl'

/**
 * Accent presets a user can pick from Settings — the "custom color
 * management" every enterprise admin template ships. Kept as a small
 * fixed list rather than a free color picker so the rest of the
 * palette (backgrounds, text, dividers) stays coherent regardless of
 * which accent is chosen.
 */
export const accentPresets = {
  teal: { light: '#2F5D62', dark: '#6FA8AD' },
  indigo: { light: '#3F4B8C', dark: '#8891D8' },
  clay: { light: '#B5562F', dark: '#E28F62' },
  forest: { light: '#3B6B41', dark: '#7FB585' },
  plum: { light: '#6B3F6E', dark: '#B27EB5' },
} as const

export type AccentPreset = keyof typeof accentPresets

/**
 * Palette kept deliberately distinct from MUI's stock blue-on-white
 * default so the boilerplate doesn't read as "unstyled MUI" out of the
 * box, while staying calm enough for a data-dense enterprise app.
 */
function getPalette(mode: ThemeMode, accent: AccentPreset) {
  const accentColor = accentPresets[accent][mode]
  return {
    light: {
      primary: { main: accentColor, contrastText: '#FFFFFF' },
      secondary: { main: '#C77B4D' }, // muted clay accent, constant across presets
      background: { default: '#F6F7F5', paper: '#FFFFFF' },
      text: { primary: '#1B1F1E', secondary: '#5B6560' },
      divider: '#E1E4E1',
    },
    dark: {
      primary: { main: accentColor, contrastText: '#0B1210' },
      secondary: { main: '#E0996B' },
      background: { default: '#121513', paper: '#191D1B' },
      text: { primary: '#EDEFED', secondary: '#A6ADA9' },
      divider: '#2B302D',
    },
  }[mode]
}

export function getTheme(mode: ThemeMode, direction: ThemeDirection, accent: AccentPreset = 'teal') {
  const options: ThemeOptions = {
    direction,
    palette: {
      mode,
      ...getPalette(mode, accent),
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 220,
        standard: 220,
        complex: 320,
        enteringScreen: 220,
        leavingScreen: 180,
      },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiAppBar: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
    },
  }

  return createTheme(options)
}
