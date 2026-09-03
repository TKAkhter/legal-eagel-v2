import { Box, Typography, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface NotFoundPageProps {
  /** Override for deep-link cases, e.g. "We couldn't find this client." */
  message?: string
}

export function NotFoundPage({ message }: NotFoundPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        height: '100%',
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
      <Typography variant="h3" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography color="text.secondary">{message ?? t('errors.notFound')}</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        {t('nav.dashboard')}
      </Button>
    </Box>
  )
}
