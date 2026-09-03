import { Box, Typography, Chip, Button } from '@mui/material'
import { UserPlus, ShieldOff, ShieldCheck, Tag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import { BulkStatusUpdateDialog } from '@/components/data-grid/BulkStatusUpdateDialog'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/components/feedback/ToastProvider'
import { usersApi } from '../api/users-api'
import type { AppUser, UserStatus } from '../types/app-user'
import type { ColumnDef, RowMenuItem } from '@/components/data-grid/types'

const statusColor: Record<UserStatus, 'success' | 'info' | 'error'> = {
  active: 'success',
  invited: 'info',
  suspended: 'error',
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
]

export function UsersListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [bulkStatusRows, setBulkStatusRows] = useState<AppUser[] | null>(null)

  const columns: ColumnDef<AppUser>[] = [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'email', headerName: 'Email', sortable: true },
    { field: 'roleName', headerName: 'Role' },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      renderCell: (row) => <Chip size="small" label={row.status} color={statusColor[row.status]} />,
    },
  ]

  const rowMenuItems: RowMenuItem<AppUser>[] = [
    {
      label: 'Suspend',
      icon: <ShieldOff size={16} />,
      permission: 'users:edit',
      destructive: true,
      onClick: async (row) => {
        await usersApi.update(row.id, { status: 'suspended' })
        showToast(`${row.name} suspended`, 'success')
      },
    },
    {
      label: 'Reactivate',
      icon: <ShieldCheck size={16} />,
      permission: 'users:edit',
      onClick: async (row) => {
        await usersApi.update(row.id, { status: 'active' })
        showToast(`${row.name} reactivated`, 'success')
      },
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('nav.users')}
        </Typography>
        <RequirePermission permission="users:edit">
          <Button variant="contained" startIcon={<UserPlus size={16} />} onClick={() => showToast('Invite user (demo)', 'info')}>
            Invite user
          </Button>
        </RequirePermission>
      </Box>

      <AdvancedDataGrid<AppUser>
        queryKey="users"
        fetchFn={usersApi.list}
        columns={columns}
        filters={{
          fields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'status', label: 'Status', type: 'select', options: statusOptions },
          ],
        }}
        rowActions={{ items: rowMenuItems }}
        selection={{
          enabled: true,
          bulkActions: [
            {
              label: t('common.updateStatus'),
              icon: <Tag size={16} />,
              permission: 'users:edit',
              onClick: (rows) => setBulkStatusRows(rows),
            },
          ],
        }}
        toolbar={{ showRefresh: true }}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
      />

      <BulkStatusUpdateDialog
        open={!!bulkStatusRows}
        onClose={() => setBulkStatusRows(null)}
        options={statusOptions}
        selectedCount={bulkStatusRows?.length ?? 0}
        onApply={async (newStatus) => {
          if (!bulkStatusRows) return
          await Promise.all(bulkStatusRows.map((row) => usersApi.update(row.id, { status: newStatus as UserStatus })))
          queryClient.invalidateQueries({ queryKey: ['users'] })
          showToast(`${bulkStatusRows.length} users updated`, 'success')
        }}
      />
    </Box>
  )
}
