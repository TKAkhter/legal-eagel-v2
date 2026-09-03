import { Box, Tooltip } from '@mui/material'
import { Check } from 'lucide-react'
import { accentPresets, type AccentPreset } from '@/theme'
import { useUiPreferences } from '@/lib/store/ui-preferences-store'

const presetLabels: Record<AccentPreset, string> = {
  teal: 'Teal',
  indigo: 'Indigo',
  clay: 'Clay',
  forest: 'Forest',
  plum: 'Plum',
}

export function AccentColorPicker() {
  const accent = useUiPreferences((s) => s.accent)
  const setAccent = useUiPreferences((s) => s.setAccent)
  const mode = useUiPreferences((s) => s.mode)

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {(Object.keys(accentPresets) as AccentPreset[]).map((preset) => {
        const color = accentPresets[preset][mode]
        const selected = accent === preset
        return (
          <Tooltip key={preset} title={presetLabels[preset]}>
            <Box
              onClick={() => setAccent(preset)}
              role="button"
              aria-label={`Use ${presetLabels[preset]} accent`}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 2,
                borderColor: selected ? 'text.primary' : 'transparent',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              {selected && <Check size={16} color="#fff" />}
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}
