import { useState } from 'react'
import { Box, Button, Chip, Menu, MenuItem } from '@mui/material'
import { Download, Mail, RefreshCw, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RequirePermission } from '@/components/auth/RequirePermission'
import type { BulkAction } from './types'

export type ExportFormat = 'csv' | 'xlsx'

interface DataGridToolbarProps<T> {
  onExport?: (format: ExportFormat) => void
  /** Which formats to offer. A single entry renders a plain button; more than one adds a format-choice menu. Defaults to ['csv']. */
  exportFormats?: ExportFormat[]
  isExporting?: boolean
  onSendMail?: () => void
  onRefresh?: () => void
  showRefresh?: boolean
  selectedRows: T[]
  bulkActions?: BulkAction<T>[]
}

const formatLabels: Record<ExportFormat, string> = { csv: 'CSV', xlsx: 'Excel' }

export function DataGridToolbar<T>({
  onExport,
  exportFormats = ['csv'],
  isExporting,
  onSendMail,
  onRefresh,
  showRefresh,
  selectedRows,
  bulkActions,
}: DataGridToolbarProps<T>) {
  const { t } = useTranslation()
  const hasSelection = selectedRows.length > 0
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
      {hasSelection && <Chip size="small" label={t('common.selected', { count: selectedRows.length })} />}

      {hasSelection &&
        bulkActions?.map((action) =>
          action.permission ? (
            <RequirePermission key={action.label} permission={action.permission}>
              <Button size="small" startIcon={action.icon} onClick={() => action.onClick(selectedRows)}>
                {action.label}
              </Button>
            </RequirePermission>
          ) : (
            <Button key={action.label} size="small" startIcon={action.icon} onClick={() => action.onClick(selectedRows)}>
              {action.label}
            </Button>
          ),
        )}

      <Box sx={{ flexGrow: 1 }} />

      {showRefresh && (
        <Button size="small" variant="text" startIcon={<RefreshCw size={16} />} onClick={onRefresh}>
          {t('common.refresh')}
        </Button>
      )}
      {onSendMail && (
        <Button size="small" variant="outlined" startIcon={<Mail size={16} />} onClick={onSendMail}>
          {t('common.sendByMail')}
        </Button>
      )}
      {onExport && exportFormats.length === 1 && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Download size={16} />}
          onClick={() => onExport(exportFormats[0])}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting…' : t('common.export')}
        </Button>
      )}
      {onExport && exportFormats.length > 1 && (
        <>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={16} />}
            endIcon={<ChevronDown size={14} />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting…' : t('common.export')}
          </Button>
          <Menu anchorEl={exportMenuAnchor} open={!!exportMenuAnchor} onClose={() => setExportMenuAnchor(null)}>
            {exportFormats.map((format) => (
              <MenuItem
                key={format}
                onClick={() => {
                  setExportMenuAnchor(null)
                  onExport(format)
                }}
              >
                {formatLabels[format]}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Box>
  )
}
