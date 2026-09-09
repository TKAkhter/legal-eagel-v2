import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Select, Typography, Box, Alert,
} from '@mui/material'
import Papa from 'papaparse'
import { useTranslation } from 'react-i18next'
import { Dropzone } from './Dropzone'

export interface CsvImportField {
  key: string
  label: string
  required?: boolean
}

interface CsvImportWizardProps<T> {
  open: boolean
  onClose: () => void
  fields: CsvImportField[]
  onImport: (rows: T[]) => Promise<void>
}

/**
 * Generic three-step CSV import: upload -> map spreadsheet columns to
 * your module's fields -> confirm. `fields` describes the target shape;
 * `onImport` receives plain objects keyed by `field.key`. Reused
 * anywhere a module needs bulk import (Leads shown as the reference —
 * see the "Import" button on `LeadsListPage`).
 */
export function CsvImportWizard<T extends Record<string, unknown>>({
  open,
  onClose,
  fields,
  onImport,
}: CsvImportWizardProps<T>) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep(0)
    setCsvHeaders([])
    setCsvRows([])
    setMapping({})
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFile = (files: File[]) => {
    const file = files[0]
    if (!file) return
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvHeaders(result.meta.fields ?? [])
        setCsvRows(result.data)
        // Best-effort auto-map by matching header names to field labels/keys.
        const auto: Record<string, string> = {}
        fields.forEach((f) => {
          const match = (result.meta.fields ?? []).find(
            (h) => h.toLowerCase() === f.key.toLowerCase() || h.toLowerCase() === f.label.toLowerCase(),
          )
          if (match) auto[f.key] = match
        })
        setMapping(auto)
        setStep(1)
      },
      error: (err) => setError(err.message),
    })
  }

  const missingRequired = fields.filter((f) => f.required && !mapping[f.key])

  const handleConfirm = async () => {
    setIsImporting(true)
    setError(null)
    try {
      const mapped = csvRows.map((row) => {
        const obj: Record<string, unknown> = {}
        fields.forEach((f) => {
          const sourceCol = mapping[f.key]
          if (sourceCol) obj[f.key] = row[sourceCol]
        })
        return obj as T
      })
      await onImport(mapped)
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('csvImport.importFailed'))
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('csvImport.title')}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>{t('csvImport.steps.upload')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('csvImport.steps.mapColumns')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('csvImport.steps.confirm')}</StepLabel>
          </Step>
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 0 && (
          <Dropzone onFilesSelected={handleFile} multiple={false} accept=".csv" hint={t('csvImport.csvFilesOnly')} />
        )}

        {step === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('csvImport.matchColumns', { count: csvRows.length })}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('csvImport.field')}</TableCell>
                  <TableCell>{t('csvImport.csvColumn')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((f) => (
                  <TableRow key={f.key}>
                    <TableCell>
                      {f.label}
                      {f.required && ' *'}
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={mapping[f.key] ?? ''}
                        onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))}
                      >
                        <MenuItem value="">
                          <em>{t('csvImport.dontImport')}</em>
                        </MenuItem>
                        {csvHeaders.map((h) => (
                          <MenuItem key={h} value={h}>
                            {h}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {step === 2 && <Typography>{t('csvImport.readyToImport', { count: csvRows.length })}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        {step > 0 && <Button onClick={() => setStep((s) => s - 1)}>{t('common.back')}</Button>}
        {step === 1 && (
          <Button variant="contained" disabled={missingRequired.length > 0} onClick={() => setStep(2)}>
            {t('common.next')}
          </Button>
        )}
        {step === 2 && (
          <Button variant="contained" onClick={handleConfirm} disabled={isImporting}>
            {isImporting ? t('csvImport.importing') : t('csvImport.import')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
