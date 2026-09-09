import { useState, useEffect } from 'react'
import { Box, Typography, Breadcrumbs, Link, Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material'
import { Folder, File as FileIcon, Pencil, Trash2, Upload, FolderPlus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import { Dropzone } from '@/components/forms/Dropzone'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { useToast } from '@/components/feedback/ToastProvider'
import { filesApi } from '../api/files-api'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'
import type { DriveItem } from '../types/drive-item'
import type { ColumnDef, RowMenuItem } from '@/components/data-grid/types'

function formatSize(kb: number | null) {
  if (kb == null) return '—'
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}

export function FileManagerPage() {
  const { t } = useTranslation()
  const { confirm } = useConfirm()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const { formatDate } = useLocaleDate()

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  // Fresh open must never show a name left over from a previous open
  // that was closed without creating (backdrop click, Escape, etc.).
  useEffect(() => {
    if (newFolderOpen) setNewFolderName('')
  }, [newFolderOpen])

  const { data: breadcrumbTrail } = useQuery({
    queryKey: ['files-path', currentFolderId],
    queryFn: () => filesApi.getPath(currentFolderId),
  })

  const invalidateListing = () => queryClient.invalidateQueries({ queryKey: [`files-${currentFolderId}`] })

  const columns: ColumnDef<DriveItem>[] = [
    {
      field: 'name',
      headerName: t('common.name'),
      sortable: true,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.type === 'folder' ? <Folder size={16} /> : <FileIcon size={16} />}
          {row.name}
        </Box>
      ),
    },
    { field: 'sizeKb', headerName: t('files.size'), renderCell: (row) => formatSize(row.sizeKb) },
    { field: 'modifiedAt', headerName: t('files.modified'), sortable: true, renderCell: (row) => formatDate(row.modifiedAt) },
  ]

  const rowMenuItems: RowMenuItem<DriveItem>[] = [
    {
      label: t('common.rename'),
      icon: <Pencil size={16} />,
      permission: 'files:edit',
      onClick: async (row) => {
        const name = window.prompt(t('files.newNamePrompt'), row.name)
        if (name && name !== row.name) {
          await filesApi.rename(row.id, name)
          invalidateListing()
        }
      },
    },
    {
      label: t('common.delete'),
      icon: <Trash2 size={16} />,
      permission: 'files:edit',
      destructive: true,
      onClick: async (row) => {
        const ok = await confirm({ title: t('files.deleteConfirmTitle', { name: row.name }), destructive: true, confirmLabel: t('common.delete') })
        if (ok) {
          await filesApi.remove(row.id)
          invalidateListing()
          showToast(t('files.deleted'), 'success')
        }
      },
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('nav.files')}
        </Typography>
        <RequirePermission permission="files:edit">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<FolderPlus size={16} />} onClick={() => setNewFolderOpen(true)}>
              {t('files.newFolder')}
            </Button>
            <Button size="small" variant="contained" startIcon={<Upload size={16} />} onClick={() => setUploadOpen(true)}>
              {t('common.upload')}
            </Button>
          </Box>
        </RequirePermission>
      </Box>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" underline="hover" onClick={() => setCurrentFolderId(null)}>
          {t('nav.files')}
        </Link>
        {breadcrumbTrail?.map((item) => (
          <Link key={item.id} component="button" underline="hover" onClick={() => setCurrentFolderId(item.id)}>
            {item.name}
          </Link>
        ))}
      </Breadcrumbs>

      <AdvancedDataGrid<DriveItem>
        key={currentFolderId ?? 'root'}
        queryKey={`files-${currentFolderId}`}
        fetchFn={(params) => filesApi.listItems(currentFolderId, params)}
        columns={columns}
        filters={{ fields: [{ name: 'name', label: t('common.name'), type: 'text' }] }}
        rowActions={{ items: rowMenuItems }}
        selection={{
          enabled: true,
          bulkActions: [
            {
              label: t('common.delete'),
              icon: <Trash2 size={16} />,
              permission: 'files:edit',
              onClick: async (rows) => {
                const ok = await confirm({ title: t('files.deleteManyConfirmTitle', { count: rows.length }), destructive: true, confirmLabel: t('common.delete') })
                if (ok) {
                  await Promise.all(rows.map((r) => filesApi.remove(r.id)))
                  invalidateListing()
                  showToast(t('files.itemsDeleted', { count: rows.length }), 'success')
                }
              },
            },
          ],
        }}
        toolbar={{ showRefresh: true }}
        onRowClick={(row) => {
          if (row.type === 'folder') setCurrentFolderId(row.id)
          else showToast(t('files.previewingDemo', { name: row.name }), 'info')
        }}
      />

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('common.upload')}</DialogTitle>
        <DialogContent>
          <Dropzone
            onFilesSelected={async (files) => {
              await filesApi.upload(currentFolderId, files)
              invalidateListing()
              setUploadOpen(false)
              showToast(t('files.filesUploaded', { count: files.length }), 'success')
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={newFolderOpen} onClose={() => setNewFolderOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('files.newFolder')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('files.folderName')}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            disabled={!newFolderName}
            onClick={async () => {
              await filesApi.createFolder(currentFolderId, newFolderName)
              invalidateListing()
              setNewFolderName('')
              setNewFolderOpen(false)
            }}
          >
            {t('files.create')}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
