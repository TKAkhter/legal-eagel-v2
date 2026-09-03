import { Box, Typography, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
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
        403
      </Typography>
      <Typography color="text.secondary">{t('errors.forbidden')}</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        {t('nav.dashboard')}
      </Button>
    </Box>
  )
}
