import { useState, useEffect } from 'react'
import {
  AppBar, Toolbar, IconButton, Box, InputBase, Badge, Menu, MenuItem, Avatar,
  Divider, ListItemIcon, ListItemText, useMediaQuery, useTheme, Tooltip,
} from '@mui/material'
import { Menu as MenuIcon, Search, Bell, Sun, Moon, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useNavStore } from '@/lib/store/nav-store'
import { useUiPreferences } from '@/lib/store/ui-preferences-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { supportedLanguages } from '@/i18n'
import { CommandPalette } from './CommandPalette'
import { NotificationPanel } from './NotificationPanel'
import { notificationsApi } from '@/lib/notifications/notifications-api'

export function Topbar() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const handleHamburgerClick = useNavStore((s) => s.handleHamburgerClick)
  const mode = useUiPreferences((s) => s.mode)
  const toggleMode = useUiPreferences((s) => s.toggleMode)
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null)
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Lightweight poll just for the unread badge count — the panel itself
  // fetches full details lazily (only while open, see NotificationPanel).
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    refetchInterval: 60_000,
  })
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const onHamburger = () => handleHamburgerClick(isDesktop ? 'desktop' : 'mobile')

  const onLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={onHamburger} aria-label="toggle navigation">
          <MenuIcon size={20} />
        </IconButton>

        <Box
          onClick={() => setPaletteOpen(true)}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            bgcolor: 'action.hover',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            flexGrow: 1,
            maxWidth: 420,
            cursor: 'pointer',
          }}
        >
          <Search size={16} />
          <InputBase placeholder={t('common.search')} fullWidth readOnly sx={{ fontSize: 14, cursor: 'pointer' }} />
          <Box
            sx={{
              fontSize: 11,
              color: 'text.secondary',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              px: 0.5,
              flexShrink: 0,
            }}
          >
            ⌘K
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
          <IconButton onClick={toggleMode} aria-label="toggle theme">
            {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </IconButton>
        </Tooltip>

        <IconButton onClick={(e) => setLangMenuAnchor(e.currentTarget)} aria-label="change language">
          <Box sx={{ fontSize: 13, fontWeight: 700 }}>{i18n.language.toUpperCase()}</Box>
        </IconButton>
        <Menu anchorEl={langMenuAnchor} open={!!langMenuAnchor} onClose={() => setLangMenuAnchor(null)}>
          {supportedLanguages.map((lng) => (
            <MenuItem
              key={lng}
              selected={i18n.language === lng}
              onClick={() => {
                i18n.changeLanguage(lng)
                setLangMenuAnchor(null)
              }}
            >
              {lng.toUpperCase()}
            </MenuItem>
          ))}
        </Menu>

        <IconButton aria-label="notifications" onClick={(e) => setNotifAnchor(e.currentTarget)}>
          <Badge badgeContent={unreadCount} color="error">
            <Bell size={18} />
          </Badge>
        </IconButton>
        <NotificationPanel anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />

        <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} aria-label="Account menu">
          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
            {user?.name?.[0]?.toUpperCase() ?? <UserIcon size={16} />}
          </Avatar>
        </IconButton>
        <Menu anchorEl={userMenuAnchor} open={!!userMenuAnchor} onClose={() => setUserMenuAnchor(null)}>
          <MenuItem disabled sx={{ opacity: '1 !important' }}>
            <ListItemText primary={user?.name} secondary={user?.email} />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setUserMenuAnchor(null)
              navigate('/settings')
            }}
          >
            <ListItemIcon>
              <Settings size={16} />
            </ListItemIcon>
            <ListItemText>{t('nav.settings')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={onLogout}>
            <ListItemIcon>
              <LogOut size={16} />
            </ListItemIcon>
            <ListItemText>Log out</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </AppBar>
  )
}
