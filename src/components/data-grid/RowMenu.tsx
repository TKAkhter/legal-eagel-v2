import { useState, type MouseEvent } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { MoreVertical } from 'lucide-react'
import { RequirePermission } from '@/components/auth/RequirePermission'
import type { RowMenuItem } from './types'

export function RowMenu<T>({ row, items }: { row: T; items: RowMenuItem<T>[] }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  const open = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation() // don't also trigger the row's onRowClick navigation
    setAnchor(e.currentTarget)
  }
  const close = () => setAnchor(null)

  return (
    <>
      <IconButton size="small" onClick={open} aria-label="row actions">
        <MoreVertical size={16} />
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close} onClick={(e) => e.stopPropagation()}>
        {items.map((item) => {
          const menuItem = (
            <MenuItem
              key={item.label}
              onClick={() => {
                close()
                item.onClick(row)
              }}
              sx={item.destructive ? { color: 'error.main' } : undefined}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          )
          return item.permission ? (
            <RequirePermission key={item.label} permission={item.permission}>
              {menuItem}
            </RequirePermission>
          ) : (
            menuItem
          )
        })}
      </Menu>
    </>
  )
}
