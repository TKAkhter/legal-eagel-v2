import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PagedResult, QueryParams } from '@/lib/api-client/types'

const writeFileMock = vi.fn()

vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: (...args: unknown[]) => writeFileMock(...args),
}))

const { exportToXlsx } = await import('./xlsx-export')

interface Row {
  id: string
  name: string
  amount: number
}

describe('exportToXlsx', () => {
  beforeEach(() => {
    writeFileMock.mockClear()
  })

  const rows: Row[] = [
    { id: '1', name: 'Alpha', amount: 100 },
    { id: '2', name: 'Beta', amount: 200 },
  ]

  const fetchFn = vi.fn(
    async (_params: QueryParams): Promise<PagedResult<Row>> => ({
      items: rows,
      total: rows.length,
      page: 1,
      pageSize: 10_000,
    }),
  )

  it('fetches with a large page size to get every matching row', async () => {
    await exportToXlsx(fetchFn, { page: 3, pageSize: 10 }, [{ header: 'Name', value: (r) => r.name }], 'export')
    expect(fetchFn).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 10_000 }))
  })

  it('writes a file with the given name, appending .xlsx if missing', async () => {
    await exportToXlsx(fetchFn, {}, [{ header: 'Name', value: (r) => r.name }], 'my-export')
    expect(writeFileMock).toHaveBeenCalledWith(expect.anything(), 'my-export.xlsx')
  })

  it('does not double up .xlsx if the filename already has it', async () => {
    await exportToXlsx(fetchFn, {}, [{ header: 'Name', value: (r) => r.name }], 'my-export.xlsx')
    expect(writeFileMock).toHaveBeenCalledWith(expect.anything(), 'my-export.xlsx')
  })

  it('returns the number of exported rows', async () => {
    const count = await exportToXlsx(fetchFn, {}, [{ header: 'Name', value: (r) => r.name }], 'export')
    expect(count).toBe(2)
  })
})
