import { List, ListItemButton, ListItemText, Typography, Box, Skeleton, InputBase } from '@mui/material'
import { Star, Search } from 'lucide-react'
import { useState } from 'react'
import type { MailMessage } from '../types/mail'

interface MailMessageListProps {
  messages: MailMessage[]
  isLoading: boolean
  selectedMessageId: string | null
  onSelectMessage: (id: string) => void
}

export function MailMessageList({ messages, isLoading, selectedMessageId, onSelectMessage }: MailMessageListProps) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? messages.filter((m) => m.subject.toLowerCase().includes(search.toLowerCase()))
    : messages

  return (
    <Box sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', borderInlineEnd: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Search size={16} />
        <InputBase
          placeholder="Search mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ fontSize: 14 }}
        />
      </Box>

      <List disablePadding sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} sx={{ px: 2, py: 1.5 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="90%" />
            </Box>
          ))}

        {!isLoading && filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            No messages
          </Typography>
        )}

        {!isLoading &&
          filtered.map((message) => (
            <ListItemButton
              key={message.id}
              selected={message.id === selectedMessageId}
              onClick={() => onSelectMessage(message.id)}
              sx={{ alignItems: 'flex-start', borderBottom: 1, borderColor: 'divider', py: 1.25 }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: message.isRead ? 400 : 700, flexGrow: 1 }} noWrap>
                      {message.fromName}
                    </Typography>
                    {message.isFlagged && <Star size={14} fill="currentColor" />}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" sx={{ fontWeight: message.isRead ? 400 : 700 }} noWrap>
                      {message.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="span" sx={{ display: 'block' }}>
                      {message.bodyPreview}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          ))}
      </List>
    </Box>
  )
}
