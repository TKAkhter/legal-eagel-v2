import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Snackbar, Alert, Button } from '@mui/material'

type ToastSeverity = 'success' | 'error' | 'info' | 'warning'
interface ToastAction {
  label: string
  onClick: () => void
}
interface ToastMessage {
  id: number
  message: string
  severity: ToastSeverity
  action?: ToastAction
  /** Longer than the default 4s when there's an action to click (undo, etc.) — gives people time to react. */
  durationMs: number
}

interface ToastOptions {
  action?: ToastAction
  durationMs?: number
}

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastMessage[]>([])

  const showToast = useCallback(
    (message: string, severity: ToastSeverity = 'success', options?: ToastOptions) => {
      setQueue((q) => [
        ...q,
        {
          id: Date.now() + Math.random(),
          message,
          severity,
          action: options?.action,
          durationMs: options?.durationMs ?? (options?.action ? 6000 : 4000),
        },
      ])
    },
    [],
  )

  const handleClose = (id: number) => {
    setQueue((q) => q.filter((t) => t.id !== id))
  }

  const current = queue[0]

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={!!current}
        autoHideDuration={current?.durationMs ?? 4000}
        onClose={() => current && handleClose(current.id)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {current ? (
          <Alert
            onClose={() => handleClose(current.id)}
            severity={current.severity}
            variant="filled"
            sx={{ width: '100%' }}
            action={
              current.action ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    current.action!.onClick()
                    handleClose(current.id)
                  }}
                >
                  {current.action.label}
                </Button>
              ) : undefined
            }
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  )
}
