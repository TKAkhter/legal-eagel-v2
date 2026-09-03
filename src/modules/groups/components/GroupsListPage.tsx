import { Box, Typography, Button } from '@mui/material'
import { FolderPlus, Pencil, Trash2, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/components/feedback/ToastProvider'
import { useUndoableDelete } from '@/lib/undo/use-undoable-delete'
import { groupsApi } from '../api/groups-api'
import type { Group } from '../types/group'
import type { ColumnDef, RowMenuItem } from '@/components/data-grid/types'

export function GroupsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const { deleteWithUndo, deleteManyWithUndo } = useUndoableDelete<Group>({
    queryKeyPrefix: 'groups',
    removeFn: groupsApi.remove,
    getLabel: (group) => group.name,
  })

  const columns: ColumnDef<Group>[] = [
    { field: 'name', headerName: 'Group', sortable: true },
    { field: 'memberCount', headerName: 'Members', sortable: true },
  ]

  const rowMenuItems: RowMenuItem<Group>[] = [
    { label: 'Rename', icon: <Pencil size={16} />, permission: 'groups:edit', onClick: () => showToast('Rename (demo)', 'info') },
    {
      label: t('common.duplicate'),
      icon: <Copy size={16} />,
      permission: 'groups:edit',
      onClick: async (row) => {
        await groupsApi.create({ name: `${row.name} (copy)`, memberCount: 0 })
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        showToast('Group duplicated', 'success')
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      permission: 'groups:edit',
      destructive: true,
      onClick: (row) => deleteWithUndo(row),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('nav.groups')}
        </Typography>
        <RequirePermission permission="groups:edit">
          <Button variant="contained" startIcon={<FolderPlus size={16} />} onClick={() => showToast('New group (demo)', 'info')}>
            New group
          </Button>
        </RequirePermission>
      </Box>

      <AdvancedDataGrid<Group>
        queryKey="groups"
        fetchFn={groupsApi.list}
        columns={columns}
        filters={{ fields: [{ name: 'name', label: 'Group', type: 'text' }] }}
        rowActions={{ items: rowMenuItems }}
        selection={{
          enabled: true,
          bulkActions: [
            {
              label: t('common.delete'),
              icon: <Trash2 size={16} />,
              permission: 'groups:edit',
              onClick: (rows) => deleteManyWithUndo(rows),
            },
          ],
        }}
        toolbar={{ showRefresh: true }}
        onRowClick={(row) => navigate(`/groups/${row.id}`)}
      />
    </Box>
  )
}
