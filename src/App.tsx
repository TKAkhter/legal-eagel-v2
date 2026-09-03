import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { AppQueryProvider } from '@/app/providers/AppQueryProvider'
import { AppThemeProvider } from '@/app/providers/AppThemeProvider'
import { MsalAppProvider } from '@/app/providers/MsalAppProvider'
import { ToastProvider } from '@/components/feedback/ToastProvider'
import { ConfirmProvider } from '@/components/feedback/ConfirmProvider'
import { PwaUpdatePrompt } from '@/components/feedback/PwaUpdatePrompt'
import { MaintenancePage } from '@/app/routes/MaintenancePage'
import { router } from '@/app/routes/router'
import { featureFlags } from '@/lib/feature-flags'

function App() {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <PwaUpdatePrompt />
        {featureFlags.maintenanceMode ? (
          <MaintenancePage />
        ) : (
          <AppQueryProvider>
            <MsalAppProvider>
              <ToastProvider>
                <ConfirmProvider>
                  <RouterProvider router={router} />
                </ConfirmProvider>
              </ToastProvider>
            </MsalAppProvider>
          </AppQueryProvider>
        )}
      </AppThemeProvider>
    </ErrorBoundary>
  )
}

export default App
