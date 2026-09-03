import { useState } from 'react'
import { Box, Paper } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mailApi } from '../api/mail-api'
import { MailFolderList } from './MailFolderList'
import { MailMessageList } from './MailMessageList'
import { MailReadingPane } from './MailReadingPane'
import { ComposeDialog } from './ComposeDialog'
import type { MailMessage } from '../types/mail'

export function MailPage() {
  const queryClient = useQueryClient()
  const [selectedFolderId, setSelectedFolderId] = useState('inbox')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyTo, setReplyTo] = useState<{ to: string; subject: string } | undefined>()

  const { data: folders } = useQuery({ queryKey: ['mail-folders'], queryFn: mailApi.listFolders })

  const { data: messagesResult, isLoading: messagesLoading } = useQuery({
    queryKey: ['mail-messages', selectedFolderId],
    queryFn: () => mailApi.listMessages(selectedFolderId, { pageSize: 100 }),
  })

  const { data: selectedMessage, isLoading: messageLoading } = useQuery({
    queryKey: ['mail-message', selectedMessageId],
    queryFn: () => mailApi.getMessage(selectedMessageId!),
    enabled: !!selectedMessageId,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => mailApi.setRead(id, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mail-messages', selectedFolderId] }),
  })

  const flagMutation = useMutation({
    mutationFn: (id: string) => mailApi.toggleFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-messages', selectedFolderId] })
      queryClient.invalidateQueries({ queryKey: ['mail-message', selectedMessageId] })
    },
  })

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id)
    markReadMutation.mutate(id)
  }

  const handleReply = (message: MailMessage) => {
    setReplyTo({ to: message.fromEmail, subject: `Re: ${message.subject}` })
    setComposeOpen(true)
  }

  return (
    <Box sx={{ height: 'calc(100vh - 128px)' }}>
      <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ p: 1.5, flexShrink: 0 }}>
          <MailFolderList
            folders={folders ?? []}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => {
              setSelectedFolderId(id)
              setSelectedMessageId(null)
            }}
            onCompose={() => {
              setReplyTo(undefined)
              setComposeOpen(true)
            }}
          />
        </Box>

        <MailMessageList
          messages={messagesResult?.items ?? []}
          isLoading={messagesLoading}
          selectedMessageId={selectedMessageId}
          onSelectMessage={handleSelectMessage}
        />

        <MailReadingPane
          message={selectedMessage}
          isLoading={messageLoading}
          onReply={handleReply}
          onToggleFlag={(m) => flagMutation.mutate(m.id)}
        />
      </Paper>

      <ComposeDialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        initialTo={replyTo?.to}
        initialSubject={replyTo?.subject}
      />
    </Box>
  )
}
