import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as jspdfModule from 'jspdf'
import { exportToPdf } from './pdf-export'

describe('exportToPdf', () => {
  let saveMock: ReturnType<typeof vi.fn>
  let textMock: ReturnType<typeof vi.fn>
  let jsPDFSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    saveMock = vi.fn()
    textMock = vi.fn()
    // Spy on the named export itself rather than the prototype — jsPDF
    // attaches its methods per-instance (not via the prototype chain),
    // so prototype-based spying doesn't intercept anything.
    jsPDFSpy = vi.spyOn(jspdfModule, 'jsPDF').mockImplementation(function () {
      return { text: textMock, setFontSize: vi.fn(), save: saveMock } as unknown as jspdfModule.jsPDF
    })
  })

  afterEach(() => {
    jsPDFSpy.mockRestore()
  })

  it('writes the title and detail rows', () => {
    exportToPdf({
      title: 'INV-2041',
      details: [
        { label: 'Client', value: 'Acme Corp' },
        { label: 'Status', value: 'Sent' },
      ],
      filename: 'invoice',
    })

    expect(textMock).toHaveBeenCalledWith('INV-2041', expect.any(Number), expect.any(Number))
    expect(textMock).toHaveBeenCalledWith('Client:', expect.any(Number), expect.any(Number))
    expect(textMock).toHaveBeenCalledWith('Acme Corp', expect.any(Number), expect.any(Number))
  })

  it('saves with the given filename, appending .pdf if missing', () => {
    exportToPdf({ title: 'INV-2041', details: [], filename: 'my-invoice' })
    expect(saveMock).toHaveBeenCalledWith('my-invoice.pdf')
  })

  it('does not double up .pdf if the filename already has it', () => {
    exportToPdf({ title: 'INV-2041', details: [], filename: 'my-invoice.pdf' })
    expect(saveMock).toHaveBeenCalledWith('my-invoice.pdf')
  })
})
