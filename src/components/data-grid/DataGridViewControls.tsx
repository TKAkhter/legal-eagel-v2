import { Box, IconButton, Menu, MenuItem, Checkbox, ListItemText, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Columns3, Rows2, Rows3 } from 'lucide-react'
import { useState } from 'react'
import type { ColumnDef } from './types'

interface DataGridViewControlsProps<T> {
  columns: ColumnDef<T>[]
  hiddenFields: Set<string>
  onToggleColumn: (field: string) => void
  density: 'comfortable' | 'compact'
  onDensityChange: (density: 'comfortable' | 'compact') => void
}

/** The small "Columns" menu + density toggle row shown above every grid. Pulled out of `AdvancedDataGrid` to keep that file focused on the table itself. */
export function DataGridViewControls<T>({
  columns,
  hiddenFields,
  onToggleColumn,
  density,
  onDensityChange,
}: DataGridViewControlsProps<T>) {
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState<null | HTMLElement>(null)

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 1 }}>
      <Tooltip title="Columns">
        <IconButton size="small" onClick={(e) => setColumnsMenuAnchor(e.currentTarget)} aria-label="Column visibility">
          <Columns3 size={16} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={columnsMenuAnchor} open={!!columnsMenuAnchor} onClose={() => setColumnsMenuAnchor(null)}>
        {columns.map((col) => (
          <MenuItem key={col.field} onClick={() => onToggleColumn(col.field)} dense>
            <Checkbox size="small" checked={!hiddenFields.has(col.field)} sx={{ p: 0, mr: 1 }} />
            <ListItemText primary={col.headerName} />
          </MenuItem>
        ))}
      </Menu>

      <ToggleButtonGroup size="small" value={density} exclusive onChange={(_, v) => v && onDensityChange(v)}>
        <ToggleButton value="comfortable" aria-label="comfortable density">
          <Tooltip title="Comfortable">
            <Rows2 size={16} />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="compact" aria-label="compact density">
          <Tooltip title="Compact">
            <Rows3 size={16} />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
