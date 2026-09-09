import { Box, Typography, IconButton, Avatar, Divider, Chip, Skeleton, Tooltip } from '@mui/material'
import { Reply, Forward, Trash2, Star, Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { MailMessage } from '../types/mail'

interface MailReadingPaneProps {
  message: MailMessage | null | undefined
  isLoading: boolean
  onReply: (message: MailMessage) => void
  onToggleFlag: (message: MailMessage) => void
}

export function MailReadingPane({ message, isLoading, onReply, onToggleFlag }: MailReadingPaneProps) {
  const { t } = useTranslation()
  if (isLoading) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 2 }} />
      </Box>
    )
  }

  if (!message) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">{t('mail.selectToRead')}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {message.subject}
        </Typography>
        <Tooltip title={t('mail.flag')}>
          <IconButton size="small" onClick={() => onToggleFlag(message)} aria-label={message.isFlagged ? t('mail.unflagMessage') : t('mail.flagMessage')}>
            <Star size={16} fill={message.isFlagged ? 'currentColor' : 'none'} />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mail.reply')}>
          <IconButton size="small" onClick={() => onReply(message)} aria-label={t('mail.reply')}>
            <Reply size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mail.forward')}>
          <IconButton size="small" aria-label={t('mail.forward')}>
            <Forward size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')}>
          <IconButton size="small" aria-label={t('mail.deleteMessage')}>
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36 }}>{message.fromName[0]}</Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {message.fromName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {message.fromEmail} · {new Date(message.receivedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ px: 3, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{message.body}</Typography>

        {message.attachments.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {message.attachments.map((att) => (
              <Chip key={att.id} icon={<Paperclip size={14} />} label={`${att.name} (${att.sizeKb} KB)`} variant="outlined" />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
