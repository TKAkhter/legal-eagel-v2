import { useMemo, useState } from 'react'
import {
  Box, Typography, Paper, InputBase, Accordion, AccordionSummary, AccordionDetails,
  Chip, Grid, TextField, Button, Stack,
} from '@mui/material'
import { Search, ChevronDown, LifeBuoy } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { faqEntries } from './faq-data'
import { useAuthStore } from '@/lib/store/auth-store'
import { useToast } from '@/components/feedback/ToastProvider'

async function submitSupportRequest(payload: { subject: string; message: string }) {
  // Demo-only — a real build would POST this to a support inbox/ticketing API.
  await new Promise((r) => setTimeout(r, 500))
  return payload
}

export function HelpCenterPage() {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const user = useAuthStore((s) => s.user)
  const { showToast } = useToast()

  const submitMutation = useMutation({
    mutationFn: submitSupportRequest,
    onSuccess: () => {
      showToast('Support request sent — we\'ll get back to you soon.', 'success')
      setSubject('')
      setMessage('')
    },
  })

  const categories = useMemo(() => {
    const q = query.toLowerCase()
    const filtered = q
      ? faqEntries.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
      : faqEntries

    const grouped = new Map<string, typeof faqEntries>()
    filtered.forEach((f) => {
      const list = grouped.get(f.category) ?? []
      list.push(f)
      grouped.set(f.category, list)
    })
    return grouped
  }, [query])

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Help Center
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Search common questions, or reach out to support directly.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'action.hover',
              borderRadius: 2,
              px: 1.5,
              py: 1,
              mb: 2,
            }}
          >
            <Search size={16} />
            <InputBase
              placeholder="Search the help center…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              sx={{ fontSize: 14 }}
            />
          </Box>

          {categories.size === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No results for "{query}".
            </Typography>
          )}

          {Array.from(categories.entries()).map(([category, entries]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {category}
              </Typography>
              {entries.map((entry) => (
                <Accordion key={entry.id} variant="outlined" disableGutters sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {entry.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {entry.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LifeBuoy size={18} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Contact support
              </Typography>
            </Box>
            <Stack spacing={2}>
              <TextField label="From" value={user?.email ?? ''} fullWidth size="small" disabled />
              <TextField
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="How can we help?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                multiline
                minRows={4}
                size="small"
              />
              <Box>
                <Button
                  variant="contained"
                  disabled={!subject || !message || submitMutation.isPending}
                  onClick={() => submitMutation.mutate({ subject, message })}
                >
                  {submitMutation.isPending ? 'Sending…' : 'Send request'}
                </Button>
              </Box>
            </Stack>
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Getting started" size="small" onClick={() => setQuery('')} />
            <Chip label="Permissions" size="small" onClick={() => setQuery('permission')} />
            <Chip label="Filters" size="small" onClick={() => setQuery('filter')} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
