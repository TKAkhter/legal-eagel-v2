import { useEffect, useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from '@/theme'
import { useUiPreferences } from '@/lib/store/ui-preferences-store'
import { isRtl } from '@/i18n'

const ltrCache = createCache({ key: 'mui', stylisPlugins: [prefixer] })
const rtlCache = createCache({ key: 'mui-rtl', stylisPlugins: [prefixer, rtlPlugin] })

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const mode = useUiPreferences((s) => s.mode)
  const setDirection = useUiPreferences((s) => s.setDirection)
  const direction = useUiPreferences((s) => s.direction)
  const accent = useUiPreferences((s) => s.accent)

  const rtl = isRtl(i18n.language)

  useEffect(() => {
    setDirection(rtl ? 'rtl' : 'ltr')
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [rtl, i18n.language, setDirection])

  const theme = useMemo(() => getTheme(mode, direction, accent), [mode, direction, accent])

  return (
    <CacheProvider value={rtl ? rtlCache : ltrCache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  )
}
