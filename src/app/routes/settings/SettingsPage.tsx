import { useState } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, TextField, Switch, FormControlLabel, Button,
  Stack, Avatar, ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import { PanelLeft, PanelTop, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUiPreferences, type LayoutMode } from '@/lib/store/ui-preferences-store'
import { AccentColorPicker } from '@/components/layout/AccentColorPicker'
import { appVersion, buildTime } from '@/lib/version'
import { useInstallPrompt } from '@/lib/use-install-prompt'

interface TabPanelProps {
  active: boolean
  children: React.ReactNode
}
function TabPanel({ active, children }: TabPanelProps) {
  if (!active) return null
  return <Box sx={{ pt: 3 }}>{children}</Box>
}

export function SettingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const user = useAuthStore((s) => s.user)
  const mode = useUiPreferences((s) => s.mode)
  const toggleMode = useUiPreferences((s) => s.toggleMode)
  const layoutMode = useUiPreferences((s) => s.layoutMode)
  const setLayoutMode = useUiPreferences((s) => s.setLayoutMode)
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('settings.title')}
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t('settings.tabs.profile')} />
          <Tab label={t('settings.tabs.appearance')} />
          <Tab label={t('settings.tabs.security')} />
          <Tab label={t('settings.tabs.notifications')} />
        </Tabs>

        <TabPanel active={tab === 0}>
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56 }}>{user?.name?.[0]?.toUpperCase()}</Avatar>
              <Button size="small" variant="outlined">
                {t('settings.profile.changePhoto')}
              </Button>
            </Box>
            <TextField label={t('settings.profile.fullName')} defaultValue={user?.name} fullWidth size="small" />
            <TextField label={t('settings.profile.email')} defaultValue={user?.email} fullWidth size="small" disabled />
            <Box>
              <Button variant="contained">{t('settings.profile.saveChanges')}</Button>
            </Box>
          </Stack>
        </TabPanel>

        <TabPanel active={tab === 1}>
          <Stack spacing={3} sx={{ maxWidth: 420 }}>
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
              label={t('settings.appearance.darkMode')}
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('settings.appearance.accentColor')}
              </Typography>
              <AccentColorPicker />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('settings.appearance.navigationLayout')}
              </Typography>
              <ToggleButtonGroup
                value={layoutMode}
                exclusive
                onChange={(_, v: LayoutMode | null) => v && setLayoutMode(v)}
              >
                <ToggleButton value="sidebar" sx={{ gap: 1, px: 2 }}>
                  <PanelLeft size={16} />
                  {t('settings.appearance.sidebar')}
                </ToggleButton>
                <ToggleButton value="horizontal" sx={{ gap: 1, px: 2 }}>
                  <PanelTop size={16} />
                  {t('settings.appearance.horizontal')}
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {t('settings.appearance.layoutHint')}
              </Typography>
            </Box>

            {canInstall && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {t('settings.appearance.installApp')}
                </Typography>
                <Button variant="outlined" startIcon={<Download size={16} />} onClick={promptInstall}>
                  {t('settings.appearance.installOnDevice')}
                </Button>
              </Box>
            )}
          </Stack>
        </TabPanel>

        <TabPanel active={tab === 2}>
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <TextField label={t('settings.security.currentPassword')} type="password" fullWidth size="small" />
            <TextField label={t('settings.security.newPassword')} type="password" fullWidth size="small" />
            <TextField label={t('settings.security.confirmNewPassword')} type="password" fullWidth size="small" />
            <Box>
              <Button variant="contained">{t('settings.security.updatePassword')}</Button>
            </Box>
          </Stack>
        </TabPanel>

        <TabPanel active={tab === 3}>
          <Stack spacing={1} sx={{ maxWidth: 420 }}>
            <FormControlLabel control={<Switch defaultChecked />} label={t('settings.notifications.matterStatusChanges')} />
            <FormControlLabel control={<Switch defaultChecked />} label={t('settings.notifications.overdueInvoices')} />
            <FormControlLabel control={<Switch />} label={t('settings.notifications.weeklyDigest')} />
          </Stack>
        </TabPanel>
      </Paper>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
        {t('settings.versionInfo', { version: appVersion, date: new Date(buildTime).toLocaleDateString() })}
      </Typography>
    </Box>
  )
}
