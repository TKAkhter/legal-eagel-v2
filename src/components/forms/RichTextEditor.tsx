import { useRef, useEffect } from 'react'
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  minHeight?: number
  placeholder?: string
}

/**
 * Intentionally minimal — `contentEditable` + `document.execCommand`
 * rather than pulling in TipTap/Slate/Lexical. Good enough for
 * composing mail bodies and matter notes in the boilerplate; if a
 * module later needs collaborative editing or structured content,
 * swap this one component for a real editor library without touching
 * anything that consumes it (same `value`/`onChange` contract).
 */
export function RichTextEditor({ value, onChange, minHeight = 180, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Keep the DOM in sync when `value` changes externally (e.g. resetting
  // the compose form) without fighting the cursor position on every keystroke.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const exec = (command: string) => {
    document.execCommand(command)
    editorRef.current?.focus()
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1, py: 0.5, bgcolor: 'action.hover' }}>
        <ToggleButtonGroup size="small">
          <ToggleButton value="bold" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')}>
            <Bold size={14} />
          </ToggleButton>
          <ToggleButton value="italic" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')}>
            <Italic size={14} />
          </ToggleButton>
          <ToggleButton value="underline" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')}>
            <Underline size={14} />
          </ToggleButton>
          <ToggleButton value="ul" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertUnorderedList')}>
            <List size={14} />
          </ToggleButton>
          <ToggleButton value="ol" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertOrderedList')}>
            <ListOrdered size={14} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder}
        sx={{
          minHeight,
          p: 1.5,
          fontSize: 14,
          outline: 'none',
          overflowY: 'auto',
          '&:empty::before': { content: 'attr(data-placeholder)', color: 'text.disabled' },
        }}
      />
    </Box>
  )
}
