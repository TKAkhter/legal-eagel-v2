import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Box, Avatar, Typography, TextField, Button, Skeleton } from '@mui/material'
import { commentsApi } from '@/lib/comments/comments-api'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'

interface CommentThreadProps {
  /** Route-prefix-style module key, e.g. 'leads', 'matters' — must match what the detail page passes consistently. */
  module: string
  entityId: string
}

/**
 * Manual notes thread — distinct from `Timeline`, which is
 * system-generated activity. Drop into any detail page:
 * `<DetailWidget title="Notes"><CommentThread module="leads" entityId={lead.id} /></DetailWidget>`
 */
export function CommentThread({ module, entityId }: CommentThreadProps) {
  const queryClient = useQueryClient()
  const { formatDateTime } = useLocaleDate()
  const [draft, setDraft] = useState('')

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', module, entityId],
    queryFn: () => commentsApi.list(module, entityId),
  })

  const addMutation = useMutation({
    mutationFn: (body: string) => commentsApi.add(module, entityId, body),
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: ['comments', module, entityId] })
    },
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
        {isLoading && <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />}

        {!isLoading && comments?.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No notes yet — be the first to add one.
          </Typography>
        )}

        {!isLoading &&
          comments?.map((comment) => (
            <Box key={comment.id} sx={{ display: 'flex', gap: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>{comment.authorName[0]}</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {comment.authorName}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {formatDateTime(comment.createdAt)}
                  </Typography>
                </Box>
                <Typography variant="body2">{comment.body}</Typography>
              </Box>
            </Box>
          ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add a note…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) addMutation.mutate(draft.trim())
          }}
        />
        <Button
          variant="contained"
          size="small"
          disabled={!draft.trim() || addMutation.isPending}
          onClick={() => addMutation.mutate(draft.trim())}
        >
          Post
        </Button>
      </Box>
    </Box>
  )
}
