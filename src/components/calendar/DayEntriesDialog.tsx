import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material'
import type { CalendarEntry } from './types'

interface DayEntriesDialogProps {
  open: boolean
  onClose: () => void
  date: string | null
  entries: CalendarEntry[]
  onEntryClick?: (entry: CalendarEntry) => void
}

export function DayEntriesDialog({ open, onClose, date, entries, onEntryClick }: DayEntriesDialogProps) {
  const metaKeys = Array.from(new Set(entries.flatMap((e) => Object.keys(e.meta ?? {}))))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{date ? new Date(date).toLocaleDateString(undefined, { dateStyle: 'full' }) : ''}</DialogTitle>
      <DialogContent>
        {entries.length === 0 ? (
          <Typography color="text.secondary">No entries for this day.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
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
