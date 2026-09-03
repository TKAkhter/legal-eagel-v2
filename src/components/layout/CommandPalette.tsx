import { useEffect, useMemo, useState } from 'react'
import {
  Dialog, List, ListItemButton, ListItemIcon, ListItemText, InputBase, Box, Typography, CircularProgress,
} from '@mui/material'
import { Search, Target, Users, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNavItems } from '@/layouts/nav-config/use-nav-items'
import { NavIcon } from './NavIcon'
import { leadsApi } from '@/modules/leads/api/leads-api'
import { clientsApi } from '@/modules/clients/api/clients-api'
import { mattersApi } from '@/modules/matters/api/matters-api'
import { useAnyPermission } from '@/lib/auth/use-permission'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface RecordResult {
  id: string
  label: string
  sublabel: string
  path: string
  icon: typeof Target
}

/**
 * Record search is intentionally a short, explicit list here (Leads,
 * Clients, Matters) rather than a generic plugin registry — keeps this
 * component easy for a junior dev to extend by copying one block, and
 * avoids importing every module's API into the palette "just in case."
 * Add a new module's search by following the same three-line pattern.
 */
async function searchRecords(query: string): Promise<RecordResult[]> {
  const [leads, clients, matters] = await Promise.all([
    leadsApi.list({ search: query, pageSize: 5 }),
    clientsApi.list({ search: query, pageSize: 5 }),
    mattersApi.list({ search: query, pageSize: 5 }),
  ])

  return [
    ...leads.items.map((l) => ({ id: l.id, label: l.name, sublabel: l.company, path: `/leads/${l.id}`, icon: Target })),
    ...clients.items.map((c) => ({ id: c.id, label: c.name, sublabel: c.organization, path: `/clients/${c.id}`, icon: Users })),
    ...matters.items.map((m) => ({ id: m.id, label: m.title, sublabel: m.clientName, path: `/matters/${m.id}`, icon: Briefcase })),
  ]
}

/**
 * Cmd/Ctrl+K opens this from anywhere in the authenticated shell (see
 * the listener in `Topbar`). Empty query shows nav destinations;
 * typing searches both nav labels and actual records (debounced).
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items } = useNavItems()
  const [query, setQuery] = useState('')
  const [recordResults, setRecordResults] = useState<RecordResult[]>([])
  const [searching, setSearching] = useState(false)
  const canSearchRecords = useAnyPermission(['leads:view', 'clients:view', 'matters:view'])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setRecordResults([])
    }
  }, [open])

  useEffect(() => {
    if (!query || !canSearchRecords) {
      setRecordResults([])
      return
    }
    setSearching(true)
    const timer = setTimeout(() => {
      searchRecords(query)
        .then(setRecordResults)
        .finally(() => setSearching(false))
    }, 200)
    return () => clearTimeout(timer)
  }, [query, canSearchRecords])

  const navResults = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter((item) => t(item.labelKey).toLowerCase().includes(q))
  }, [query, items, t])

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  const hasResults = navResults.length > 0 || recordResults.length > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Search size={18} />
        <InputBase
          autoFocus
          placeholder={t('commandPalette.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          sx={{ fontSize: 15 }}
        />
        {searching && <CircularProgress size={16} />}
      </Box>
      <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {!hasResults && !searching && (
          <Typography color="text.secondary" sx={{ px: 2, py: 3, textAlign: 'center' }}>
            {t('common.noResults')}
          </Typography>
        )}

        {navResults.map((item) => (
          <ListItemButton key={item.key} onClick={() => go(item.path)}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <NavIcon name={item.icon} />
            </ListItemIcon>
            <ListItemText primary={t(item.labelKey)} />
          </ListItemButton>
        ))}

        {recordResults.map((result) => (
          <ListItemButton key={`${result.path}`} onClick={() => go(result.path)}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <result.icon size={18} />
            </ListItemIcon>
            <ListItemText primary={result.label} secondary={result.sublabel} />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  )
}
