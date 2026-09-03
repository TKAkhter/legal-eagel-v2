import { Box, Typography, Button } from '@mui/material'
import { ServerCrash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ServerErrorPageProps {
  /** Override for a more specific message, e.g. from a failed data loader. */
  message?: string
}

/**
 * For server-side/API failures surfaced as a full page (a route whose
 * data loader threw, or a page-level query with no reasonable partial
 * UI to fall back to). Distinct from `ErrorBoundary`, which catches
 * uncaught *rendering* exceptions anywhere in the React tree — this is
 * for "the request failed," not "the UI crashed."
 */
export function ServerErrorPage({ message }: ServerErrorPageProps) {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        p: 4,
      }}
    >
      <ServerCrash size={36} />
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        500
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {message ?? 'Something went wrong on our end. Please try again in a moment.'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Go to dashboard
        </Button>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    </Box>
  )
}
