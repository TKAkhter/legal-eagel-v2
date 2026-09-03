import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Paper, TextField, Button, Typography, Alert, Link as MuiLink } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { register as registerUser } from '@/lib/auth/auth-service'
import { useAuthStore } from '@/lib/store/auth-store'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string().min(6, 'At least 6 characters'),
})
type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      setSession(result.user, result.token)
      navigate('/', { replace: true })
    },
    onError: (err: Error) => setFormError(err.message),
  })

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper elevation={0} variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          {t('auth.register')}
        </Typography>

        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

        <Box component="form" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <TextField label="Name" fullWidth margin="normal" error={!!errors.name} helperText={errors.name?.message} {...registerField('name')} />
          <TextField label={t('auth.email')} fullWidth margin="normal" error={!!errors.email} helperText={errors.email?.message} {...registerField('email')} />
          <TextField label={t('auth.password')} type="password" fullWidth margin="normal" error={!!errors.password} helperText={errors.password?.message} {...registerField('password')} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} disabled={mutation.isPending}>
            {mutation.isPending ? '…' : t('auth.register')}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
          <MuiLink component={Link} to="/login">
            {t('auth.login')}
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  )
}
