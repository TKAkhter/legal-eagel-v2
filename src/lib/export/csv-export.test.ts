import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToCsv } from './csv-export'
import type { PagedResult, QueryParams } from '@/lib/api-client/types'

interface Row {
  id: string
  name: string
  amount: number
}

describe('exportToCsv', () => {
  let clickSpy: ReturnType<typeof vi.fn>
  let createdHref: string | undefined
  let createdDownload: string | undefined

  beforeEach(() => {
    vi.restoreAllMocks()
    clickSpy = vi.fn()
    createdHref = undefined
    createdDownload = undefined

    // jsdom doesn't implement createObjectURL/revokeObjectURL — stub them.
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'href', {
          set: (v) => {
            createdHref = v
          },
          get: () => createdHref,
        })
        Object.defineProperty(el, 'download', {
          set: (v) => {
            createdDownload = v
          },
          get: () => createdDownload,
        })
        el.click = clickSpy as unknown as typeof el.click
      }
      return el
    })
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

  it('fetches with a large page size to get every matching row, not just one page', async () => {
    await exportToCsv(fetchFn, { page: 2, pageSize: 10, filters: { name: 'a' } }, [
      { header: 'Name', value: (r) => r.name },
    ], 'export.csv')

    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10_000, filters: { name: 'a' } }),
    )
  })

  it('triggers a download with the given filename, appending .csv if missing', async () => {
    await exportToCsv(fetchFn, {}, [{ header: 'Name', value: (r) => r.name }], 'my-export')
    expect(createdDownload).toBe('my-export.csv')
    expect(clickSpy).toHaveBeenCalled()
  })

  it('does not double up .csv if the filename already has it', async () => {
    await exportToCsv(fetchFn, {}, [{ header: 'Name', value: (r) => r.name }], 'my-export.csv')
    expect(createdDownload).toBe('my-export.csv')
  })

  it('returns the number of exported rows', async () => {
    const count = await exportToCsv(fetchFn, {}, [{ header: 'Name', value: (r) => r.name }], 'export')
    expect(count).toBe(2)
  })
})
