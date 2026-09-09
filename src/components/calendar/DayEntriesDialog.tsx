import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'
import type { CalendarEntry } from './types'

interface DayEntriesDialogProps {
  open: boolean
  onClose: () => void
  date: string | null
  entries: CalendarEntry[]
  onEntryClick?: (entry: CalendarEntry) => void
}

export function DayEntriesDialog({ open, onClose, date, entries, onEntryClick }: DayEntriesDialogProps) {
  const { t } = useTranslation()
  const { formatDate } = useLocaleDate()
  const metaKeys = Array.from(new Set(entries.flatMap((e) => Object.keys(e.meta ?? {}))))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{date ? formatDate(date, { dateStyle: 'full' }) : ''}</DialogTitle>
      <DialogContent>
        {entries.length === 0 ? (
          <Typography color="text.secondary">{t('common.noEntriesForDay')}</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('common.title')}</TableCell>
                {metaKeys.map((key) => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  hover={!!onEntryClick}
                  onClick={() => onEntryClick?.(entry)}
                  sx={{ cursor: onEntryClick ? 'pointer' : 'default' }}
                >
                  <TableCell>{entry.title}</TableCell>
                  {metaKeys.map((key) => (
                    <TableCell key={key}>{entry.meta?.[key] ?? '—'}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
