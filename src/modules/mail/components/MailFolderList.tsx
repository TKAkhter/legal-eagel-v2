import { List, ListItemButton, ListItemIcon, ListItemText, Badge, Paper, Button } from '@mui/material'
import { Inbox, Send, FileText, Trash2, Pencil } from 'lucide-react'
import type { MailFolder } from '../types/mail'

const folderIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  deleted: Trash2,
}

interface MailFolderListProps {
  folders: MailFolder[]
  selectedFolderId: string
  onSelectFolder: (id: string) => void
  onCompose: () => void
}

export function MailFolderList({ folders, selectedFolderId, onSelectFolder, onCompose }: MailFolderListProps) {
  return (
    <Paper variant="outlined" sx={{ width: 220, flexShrink: 0, borderRadius: 3, p: 1.5 }}>
      <Button variant="contained" fullWidth startIcon={<Pencil size={16} />} onClick={onCompose} sx={{ mb: 1.5 }}>
        Compose
      </Button>
      <List disablePadding>
        {folders.map((folder) => {
          const Icon = folderIcons[folder.id] ?? Inbox
          return (
            <ListItemButton
              key={folder.id}
              selected={folder.id === selectedFolderId}
              onClick={() => onSelectFolder(folder.id)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon size={18} />
              </ListItemIcon>
              <ListItemText primary={folder.displayName} />
              {folder.unreadItemCount > 0 && <Badge badgeContent={folder.unreadItemCount} color="primary" />}
            </ListItemButton>
          )
        })}
      </List>
    </Paper>
  )
}
