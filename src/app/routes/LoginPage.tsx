import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Paper, TextField, Button, Typography, Alert, Divider, Link as MuiLink, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { login } from '@/lib/auth/auth-service'
import { msalConfigured } from '@/lib/auth/msal-flags'
import { useAuthStore } from '@/lib/store/auth-store'
import { featureFlags } from '@/lib/feature-flags'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})
type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      setSession(result.user, result.token)
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    },
    onError: (err: Error) => setFormError(err.message),
  })

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null)
    mutation.mutate(values)
  }

  const msMutation = useMutation({
    mutationFn: async () => {
      const { loginWithMicrosoft } = await import('@/lib/auth/msal-login')
      return loginWithMicrosoft()
    },
    onSuccess: (result) => {
      setSession(result.user, result.token)
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    },
    onError: (err: Error) => setFormError(err.message),
  })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={0} variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {t('app.name')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('auth.login')}
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        {!featureFlags.msSsoOnly && (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label={t('auth.email')}
              fullWidth
              margin="normal"
              defaultValue="admin@example.com"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label={t('auth.password')}
              type="password"
              fullWidth
              margin="normal"
              defaultValue="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? '…' : t('auth.login')}
            </Button>
          </Box>
        )}

        {featureFlags.msSsoOnly && (
          <Tooltip title={msalConfigured ? '' : 'Set VITE_MSAL_CLIENT_ID / TENANT_ID / REDIRECT_URI to enable'}>
            <span>
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={!msalConfigured || msMutation.isPending}
                onClick={() => {
                  setFormError(null)
                  msMutation.mutate()
                }}
              >
                {msMutation.isPending ? '…' : t('auth.loginWithMicrosoft')}
              </Button>
            </span>
          </Tooltip>
        )}

        {!featureFlags.msSsoOnly && (
          <>
            <Divider sx={{ my: 2.5 }}>or</Divider>
            <Tooltip title={msalConfigured ? '' : 'Set VITE_MSAL_CLIENT_ID / TENANT_ID / REDIRECT_URI to enable'}>
              <span>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  disabled={!msalConfigured || msMutation.isPending}
                  onClick={() => {
                    setFormError(null)
                    msMutation.mutate()
                  }}
                >
                  {msMutation.isPending ? '…' : t('auth.loginWithMicrosoft')}
                </Button>
              </span>
            </Tooltip>
          </>
        )}

        {featureFlags.userRegistration && !featureFlags.msSsoOnly && (
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
            <MuiLink component={Link} to="/register">
              {t('auth.register')}
            </MuiLink>
          </Typography>
        )}
      </Paper>
    </Box>
  )
}
