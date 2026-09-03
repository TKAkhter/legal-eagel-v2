import type { DriveItem } from '../types/drive-item'

export const driveItemsMock: DriveItem[] = [
  { id: 'folder-contracts', parentId: null, name: 'Contracts', type: 'folder', sizeKb: null, modifiedAt: iso(1) },
  { id: 'folder-invoices', parentId: null, name: 'Invoices', type: 'folder', sizeKb: null, modifiedAt: iso(2) },
  { id: 'file-readme', parentId: null, name: 'README.docx', type: 'file', sizeKb: 48, modifiedAt: iso(3) },

  { id: 'file-contract-1', parentId: 'folder-contracts', name: 'Acme MSA.pdf', type: 'file', sizeKb: 320, modifiedAt: iso(4) },
  { id: 'file-contract-2', parentId: 'folder-contracts', name: 'Globex NDA.pdf', type: 'file', sizeKb: 180, modifiedAt: iso(5) },
  { id: 'folder-contracts-archive', parentId: 'folder-contracts', name: 'Archive', type: 'folder', sizeKb: null, modifiedAt: iso(6) },

  { id: 'file-invoice-1', parentId: 'folder-invoices', name: 'INV-2041.pdf', type: 'file', sizeKb: 96, modifiedAt: iso(1) },
  { id: 'file-invoice-2', parentId: 'folder-invoices', name: 'INV-2042.pdf', type: 'file', sizeKb: 88, modifiedAt: iso(2) },
]

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString()
}
