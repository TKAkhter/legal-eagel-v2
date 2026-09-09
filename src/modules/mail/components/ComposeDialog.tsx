import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { mailApi } from '../api/mail-api'
import { useToast } from '@/components/feedback/ToastProvider'
import { RichTextEditor } from '@/components/forms/RichTextEditor'

interface ComposeDialogProps {
  open: boolean
  onClose: () => void
  initialTo?: string
  initialSubject?: string
}

export function ComposeDialog({ open, onClose, initialTo = '', initialSubject = '' }: ComposeDialogProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [to, setTo] = useState(initialTo)
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState('')

  useEffect(() => {
    if (open) {
      setTo(initialTo)
      setSubject(initialSubject)
      setBody('')
    }
  }, [open, initialTo, initialSubject])

  const sendMutation = useMutation({
    mutationFn: mailApi.sendMessage,
    onSuccess: () => {
      showToast(t('mail.messageSent'), 'success')
      onClose()
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('mail.newMessage')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label={t('mail.to')} value={to} onChange={(e) => setTo(e.target.value)} fullWidth size="small" />
          <TextField label={t('mail.subject')} value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth size="small" />
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              {t('mail.message')}
            </Typography>
            <RichTextEditor value={body} onChange={setBody} placeholder={t('mail.writeYourMessage')} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('mail.cancel')}</Button>
        <Button
          variant="contained"
          disabled={!to || !subject || sendMutation.isPending}
          onClick={() => sendMutation.mutate({ to, subject, body })}
        >
          {sendMutation.isPending ? t('mail.sending') : t('mail.send')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
