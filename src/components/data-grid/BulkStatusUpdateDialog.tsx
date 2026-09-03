import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export interface BulkStatusOption {
  value: string
  label: string
}

interface BulkStatusUpdateDialogProps {
  open: boolean
  onClose: () => void
  options: BulkStatusOption[]
  selectedCount: number
  onApply: (newValue: string) => void | Promise<void>
  /** Defaults to the translated "Status" — pass a translated label for other fields (tier, priority, ...). */
  fieldLabel?: string
}

/**
 * Generic "change status for N selected rows" dialog — pass the
 * module's status options in, get a single `onApply(newValue)` call
 * out. Reusable for any single-select field (status, tier, priority,
 * ...), not just literally "status" — see `fieldLabel`.
 */
export function BulkStatusUpdateDialog({
  open,
  onClose,
  options,
  selectedCount,
  onApply,
  fieldLabel,
}: BulkStatusUpdateDialogProps) {
  const { t } = useTranslation()
  const label = (fieldLabel ?? t('common.status')).toLowerCase()
  const [value, setValue] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  // Every fresh open starts blank — closing via Cancel (or the backdrop)
  // must never leave a selection from a previous, possibly different,
  // batch of rows silently pre-filled (and Apply enabled) next time.
  useEffect(() => {
    if (open) setValue('')
  }, [open])

  const handleApply = async () => {
    if (!value) return
    setIsApplying(true)
    try {
      await onApply(value)
      setValue('')
      onClose()
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('common.updateStatus')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('common.setFieldForSelected', { field: label, count: selectedCount })}
        </Typography>
        <Select value={value} onChange={(e) => setValue(e.target.value)} fullWidth size="small" displayEmpty>
          <MenuItem value="">
            <em>{label}…</em>
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" disabled={!value || isApplying} onClick={handleApply}>
          {isApplying ? t('common.applying') : t('common.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
