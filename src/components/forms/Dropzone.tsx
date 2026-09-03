import { useCallback, useRef, useState, type DragEvent } from 'react'
import { Box, Typography } from '@mui/material'
import { UploadCloud } from 'lucide-react'

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void
  multiple?: boolean
  accept?: string
  hint?: string
}

/** Generic drag-and-drop upload area — used by File Manager, and reusable anywhere else a file upload is needed. */
export function Dropzone({ onFilesSelected, multiple = true, accept, hint }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragActive(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) onFilesSelected(files)
    },
    [onFilesSelected],
  )

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragActive(true)
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        bgcolor: isDragActive ? 'action.hover' : 'transparent',
        borderRadius: 3,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
      }}
    >
      <UploadCloud size={28} style={{ marginBottom: 8 }} />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Drag and drop files here, or click to browse
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) onFilesSelected(files)
          e.target.value = ''
        }}
      />
    </Box>
  )
}
