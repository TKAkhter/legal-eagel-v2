import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box, Collapse, Grid, TextField, MenuItem, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, Button, Badge, IconButton, Paper, Chip,
} from '@mui/material'
import { Filter, X, Bookmark, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FilterFieldConfig, FilterFieldOption } from '@/components/data-grid/types'
import type { FilterPreset } from '@/components/data-grid/use-filter-presets'

interface FilterBarProps {
  fields: FilterFieldConfig[]
  onApply: (values: Record<string, unknown>) => void
  onClear: () => void
  presets?: FilterPreset[]
  onSavePreset?: (name: string, values: Record<string, unknown>) => void
  onDeletePreset?: (name: string) => void
}

/** Resolves static or async (API-backed) options for select/radio fields. */
function useFieldOptions(field: FilterFieldConfig): FilterFieldOption[] {
  const [options, setOptions] = useState<FilterFieldOption[]>(
    Array.isArray(field.options) ? field.options : [],
  )

  useEffect(() => {
    if (typeof field.options === 'function') {
      field.options().then(setOptions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.name])

  return options
}

function FilterField({ field, control }: { field: FilterFieldConfig; control: ReturnType<typeof useForm>['control'] }) {
  const options = useFieldOptions(field)

  return (
    <Controller
      name={field.name}
      control={control}
      defaultValue=""
      render={({ field: rhfField }) => {
        if (field.type === 'select') {
          return (
            <TextField {...rhfField} select label={field.label} size="small" fullWidth>
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          )
        }

        if (field.type === 'radio') {
          return (
            <FormControl>
              <FormLabel sx={{ fontSize: 13 }}>{field.label}</FormLabel>
              <RadioGroup {...rhfField} row>
                {options.map((opt) => (
                  <FormControlLabel key={opt.value} value={opt.value} control={<Radio size="small" />} label={opt.label} />
                ))}
              </RadioGroup>
            </FormControl>
          )
        }

        return <TextField {...rhfField} label={field.label} size="small" fullWidth />
      }}
    />
  )
}

export function FilterBar({ fields, onApply, onClear, presets, onSavePreset, onDeletePreset }: FilterBarProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const { control, handleSubmit, reset, watch, getValues } = useForm({
    defaultValues: Object.fromEntries(fields.map((f) => [f.name, ''])),
  })

  const values = watch()
  const activeCount = Object.values(values).filter((v) => v !== '' && v != null).length

  const submit = handleSubmit((vals) => onApply(vals))

  const clear = () => {
    reset()
    onClear()
  }

  const applyPreset = (preset: FilterPreset) => {
    reset({
      ...Object.fromEntries(fields.map((f) => [f.name, ''])),
      ...preset.filters,
    } as Record<string, string>)
    onApply(preset.filters)
  }

  const saveCurrentAsPreset = () => {
    const name = window.prompt('Name this filter preset')
    if (name) onSavePreset?.(name, getValues())
  }

  if (fields.length === 0) return null

  return (
    <Paper variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
        <IconButton size="small" onClick={() => setExpanded((e) => !e)} sx={{ mr: 1 }} aria-label="Toggle filters" aria-expanded={expanded}>
          <Badge badgeContent={activeCount} color="error">
            <Filter size={18} />
          </Badge>
        </IconButton>
        <Box
          onClick={() => setExpanded((e) => !e)}
          sx={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, flexGrow: 1 }}
        >
          {t('common.filters')}
        </Box>
        {activeCount > 0 && (
          <IconButton size="small" onClick={clear} aria-label={t('common.clear')}>
            <X size={16} />
          </IconButton>
        )}
      </Box>

      <Collapse in={expanded}>
        <Box component="form" onSubmit={submit} sx={{ px: 2, pb: 2 }}>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid key={field.name} size={{ xs: 12, sm: 6, md: 3 }}>
                <FilterField field={field} control={control} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button type="submit" variant="contained" size="small">
              {t('common.apply')}
            </Button>
            <Button type="button" variant="text" size="small" onClick={clear}>
              {t('common.clear')}
            </Button>

            {onSavePreset && (
              <Button type="button" variant="text" size="small" startIcon={<Bookmark size={14} />} onClick={saveCurrentAsPreset}>
                Save as preset
              </Button>
            )}

            {presets && presets.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', ml: 'auto' }}>
                {presets.map((preset) => (
                  <Chip
                    key={preset.name}
                    label={preset.name}
                    size="small"
                    onClick={() => applyPreset(preset)}
                    onDelete={onDeletePreset ? () => onDeletePreset(preset.name) : undefined}
                    deleteIcon={<Trash2 size={12} />}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}
