import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

/** `const { confirm } = useConfirm(); if (await confirm({ title: 'Delete lead?' })) { ... }` */
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const handleClose = (result: boolean) => {
    resolver?.(result)
    setOptions(null)
    setResolver(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={!!options} onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{options?.title}</DialogTitle>
        {options?.description && (
          <DialogContent>
            <DialogContentText>{options.description}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => handleClose(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={() => handleClose(true)}
            color={options?.destructive ? 'error' : 'primary'}
            variant="contained"
            autoFocus
          >
            {options?.confirmLabel ?? t('common.apply')}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  )
}
