import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'

export interface TimelineEntry {
  id: string
  label: string
  actor: string
  timestamp: string
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { t } = useTranslation()
  const { formatDateTime } = useLocaleDate()

  if (entries.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t('common.noActivityYet')}
      </Typography>
    )
  }

  return (
    <Box sx={{ position: 'relative', pl: 2 }}>
      <Box sx={{ position: 'absolute', top: 6, bottom: 6, left: 4, width: 2, bgcolor: 'divider' }} />
      {entries.map((entry) => (
        <Box key={entry.id} sx={{ position: 'relative', pb: 2.5, pl: 2 }}>
          <Box
            sx={{
              position: 'absolute',
              left: -14,
              top: 4,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              border: '2px solid',
              borderColor: 'background.paper',
            }}
          />
          <Typography variant="body2">{entry.label}</Typography>
          <Typography variant="caption" color="text.secondary">
            {entry.actor} · {formatDateTime(entry.timestamp)}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
