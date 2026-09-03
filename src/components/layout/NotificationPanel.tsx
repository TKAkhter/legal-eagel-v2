import { Popover, Box, Typography, List, ListItemButton, ListItemText, Button, Skeleton, Chip } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { notificationsApi } from '@/lib/notifications/notifications-api'
import type { AppNotification, NotificationType } from '@/lib/notifications/types'

const typeColor: Record<NotificationType, 'info' | 'success' | 'warning' | 'error'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

function useTimeAgo() {
  const { t } = useTranslation()
  return (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime()
    const mins = Math.round(diffMs / 60_000)
    if (mins < 60) return t('notifications.minutesAgo', { count: mins })
    const hours = Math.round(mins / 60)
    if (hours < 24) return t('notifications.hoursAgo', { count: hours })
    return t('notifications.daysAgo', { count: Math.round(hours / 24) })
  }
}

interface NotificationPanelProps {
  anchorEl: HTMLElement | null
  onClose: () => void
}

export function NotificationPanel({ anchorEl, onClose }: NotificationPanelProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const timeAgo = useTimeAgo()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    enabled: !!anchorEl,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const handleClick = (n: AppNotification) => {
    if (!n.isRead) markReadMutation.mutate(n.id)
    if (n.link) navigate(n.link)
    onClose()
  }

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 360, borderRadius: 3 } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('notifications.title')}
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={() => markAllReadMutation.mutate()}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </Box>

      <List disablePadding sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ px: 2, py: 1.5 }}>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="90%" />
            </Box>
          ))}

        {!isLoading && notifications?.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            {t('notifications.allCaughtUp')}
          </Typography>
        )}

        {!isLoading &&
          notifications?.map((n) => (
            <ListItemButton
              key={n.id}
              onClick={() => handleClick(n)}
              sx={{
                alignItems: 'flex-start',
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: n.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label={n.type} color={typeColor[n.type]} sx={{ height: 18, fontSize: 11 }} />
                    <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 700, flexGrow: 1 }}>
                      {n.title}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {n.body}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {timeAgo(n.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          ))}
      </List>
    </Popover>
  )
}
