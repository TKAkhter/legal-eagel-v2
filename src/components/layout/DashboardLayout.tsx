import { Suspense } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { HorizontalNav } from './HorizontalNav'
import { AppBreadcrumbs } from './AppBreadcrumbs'
import { BreadcrumbProvider } from './breadcrumb-context'
import { RouteProgressBar } from '@/components/feedback/RouteProgressBar'
import { RouteLoadingFallback } from '@/components/feedback/RouteLoadingFallback'
import { IdleTimeoutModal } from '@/components/auth/IdleTimeoutModal'
import { FlagDebugPanel } from './FlagDebugPanel'
import { useUiPreferences } from '@/lib/store/ui-preferences-store'

export function DashboardLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const layoutMode = useUiPreferences((s) => s.layoutMode)
  const showHorizontalNav = layoutMode === 'horizontal' && isDesktop

  return (
    <BreadcrumbProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <RouteProgressBar />
        <IdleTimeoutModal />
        <FlagDebugPanel />
        <Sidebar />
        <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          {showHorizontalNav && <HorizontalNav />}
          <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
            <AppBreadcrumbs />
            <Suspense fallback={<RouteLoadingFallback />}>
              <Outlet />
            </Suspense>
          </Box>
        </Box>
      </Box>
    </BreadcrumbProvider>
  )
}
