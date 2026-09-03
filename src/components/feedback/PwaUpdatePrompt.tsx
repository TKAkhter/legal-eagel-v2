import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Snackbar, Button, Alert } from '@mui/material'

/**
 * Mount once near the app root. `vite-plugin-pwa`'s `registerType:
 * 'autoUpdate'` means a new service worker installs silently in the
 * background — this just surfaces "a new version is ready, refresh to
 * update" so users aren't stuck on stale JS indefinitely, and a brief
 * "ready to work offline" confirmation the first time the app installs.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: (error) => {
      // eslint-disable-next-line no-console
      console.error('Service worker registration failed:', error)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => setOfflineReady(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [offlineReady, setOfflineReady])

  return (
    <>
      <Snackbar open={needRefresh} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          severity="info"
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
              Refresh
            </Button>
          }
          onClose={() => setNeedRefresh(false)}
        >
          A new version is available.
        </Alert>
      </Snackbar>

      <Snackbar
        open={offlineReady}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setOfflineReady(false)}
      >
        <Alert severity="success" variant="filled" onClose={() => setOfflineReady(false)}>
          App ready to work offline.
        </Alert>
      </Snackbar>
    </>
  )
}
