import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, List, ListItemButton, ListItemText, FormGroup,
  FormControlLabel, Checkbox, Button, Divider, Chip, Skeleton,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { permissionsApi } from '../api/permissions-api'
import { permissionGroups } from '@/lib/auth/types'
import type { PermissionKey, Role } from '@/lib/auth/types'
import { useToast } from '@/components/feedback/ToastProvider'
import { useUnsavedChangesGuard } from '@/lib/navigation/use-unsaved-changes-guard'

export function PermissionsPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: permissionsApi.listRoles,
  })

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Set<PermissionKey>>(new Set())

  const selectedRole = roles?.find((r) => r.id === selectedRoleId) ?? null

  // Load the draft checklist whenever the selected role changes.
  useEffect(() => {
    if (selectedRole) setDraft(new Set(selectedRole.permissions))
  }, [selectedRole?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedRoleId && roles && roles.length > 0) setSelectedRoleId(roles[0].id)
  }, [roles, selectedRoleId])

  const isDirty =
    !!selectedRole &&
    (draft.size !== selectedRole.permissions.length ||
      selectedRole.permissions.some((p) => !draft.has(p)))

  useUnsavedChangesGuard(isDirty)

  const saveMutation = useMutation({
    mutationFn: (role: Role) => permissionsApi.updateRolePermissions(role.id, Array.from(draft)),
    onSuccess: () => {
      showToast('Permissions updated', 'success')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  const toggle = (key: PermissionKey) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const discard = () => {
    if (selectedRole) setDraft(new Set(selectedRole.permissions))
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('nav.permissions')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
        <Paper variant="outlined" sx={{ width: { xs: '100%', md: 260 }, borderRadius: 3, flexShrink: 0 }}>
          <List disablePadding>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1.5 }}>
                  <Skeleton variant="text" />
                </Box>
              ))}
            {roles?.map((role) => (
              <ListItemButton
                key={role.id}
                selected={role.id === selectedRoleId}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <ListItemText primary={role.name} secondary={`${role.permissions.length} permissions`} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ flexGrow: 1, borderRadius: 3, p: 3, width: '100%' }}>
          {!selectedRole && !isLoading && (
            <Typography color="text.secondary">Select a role to edit its permissions.</Typography>
          )}

          {selectedRole && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedRole.name}
                  </Typography>
                  {isDirty && <Chip size="small" color="warning" label="Unsaved changes" />}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={discard} disabled={!isDirty}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!isDirty || saveMutation.isPending}
                    onClick={() => saveMutation.mutate(selectedRole)}
                  >
                    {saveMutation.isPending ? '…' : t('common.save')}
                  </Button>
                </Box>
              </Box>

              {permissionGroups.map((group, idx) => (
                <Box key={group.module} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {group.module}
                  </Typography>
                  <FormGroup row>
                    {group.keys.map((key) => (
                      <FormControlLabel
                        key={key}
                        control={<Checkbox size="small" checked={draft.has(key)} onChange={() => toggle(key)} />}
                        label={key.split(':')[1]}
                      />
                    ))}
                  </FormGroup>
                  {idx < permissionGroups.length - 1 && <Divider sx={{ mt: 1 }} />}
                </Box>
              ))}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
