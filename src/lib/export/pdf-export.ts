import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PdfDetailRow {
  label: string
  value: string
}

export interface PdfLineItemColumn {
  header: string
  align?: 'left' | 'right'
}

export interface PdfDocumentOptions {
  title: string
  /** Key/value rows shown under the title, e.g. Client, Status, Due date. */
  details: PdfDetailRow[]
  /** Optional table below the details — e.g. invoice line items. */
  lineItems?: {
    columns: PdfLineItemColumn[]
    rows: (string | number)[][]
  }
  filename: string
}

/**
 * Generic single-document PDF export — not invoice-specific, so any
 * detail page (a matter summary, a report) can reuse it later. Kept
 * separate from `csv-export.ts`/`xlsx-export.ts` since those export
 * *lists* of rows; this exports one formatted document.
 */
export function exportToPdf({ title, details, lineItems, filename }: PdfDocumentOptions): void {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(title, 14, 18)

  let y = 30
  doc.setFontSize(10)
  details.forEach((row) => {
    doc.text(`${row.label}:`, 14, y)
    doc.text(row.value, 60, y)
    y += 7
  })

  if (lineItems) {
    autoTable(doc, {
      startY: y + 5,
      head: [lineItems.columns.map((c) => c.header)],
      body: lineItems.rows,
      columnStyles: Object.fromEntries(
        lineItems.columns.map((c, i) => [i, { halign: c.align ?? 'left' }]),
      ),
    })
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
