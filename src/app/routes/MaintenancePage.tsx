import { Box, Typography, Button } from '@mui/material'
import { Wrench } from 'lucide-react'

export function MaintenancePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        p: 4,
        bgcolor: 'background.default',
      }}
    >
      <Wrench size={40} />
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        We'll be back shortly
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        The app is undergoing scheduled maintenance. Thanks for your patience —
        try again in a few minutes.
      </Typography>
      <Button variant="contained" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </Box>
  )
}
