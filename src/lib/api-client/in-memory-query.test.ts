import { describe, it, expect } from 'vitest'
import { runInMemoryQuery } from './in-memory-query'

interface Row {
  id: string
  name: string
  status: string
}

const rows: Row[] = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'inactive' },
  { id: '3', name: 'Charlie', status: 'active' },
  { id: '4', name: 'Dana', status: 'active' },
]

describe('runInMemoryQuery', () => {
  it('paginates using page/pageSize', () => {
    const result = runInMemoryQuery(rows, { page: 1, pageSize: 2 })
    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(4)
    expect(result.items[0].id).toBe('1')

    const page2 = runInMemoryQuery(rows, { page: 2, pageSize: 2 })
    expect(page2.items[0].id).toBe('3')
  })

  it('filters by substring match per field by default', () => {
    const result = runInMemoryQuery(rows, { filters: { status: 'active' } })
    // 'inactive' also contains the substring 'active' — default (no
    // exactFilterFields) behavior is substring, matching all of them.
    expect(result.items.map((r) => r.id)).toEqual(['1', '2', '3', '4'])
  })

  it('filters by exact match when the field is listed in exactFilterFields', () => {
    const result = runInMemoryQuery(rows, {
      filters: { status: 'active' },
      exactFilterFields: ['status'],
    })
    expect(result.items.map((r) => r.id)).toEqual(['1', '3', '4'])
  })

  it('ignores empty-string filter values', () => {
    const result = runInMemoryQuery(rows, { filters: { status: '' } })
    expect(result.total).toBe(4)
  })

  it('does a case-insensitive substring search across all fields', () => {
    const result = runInMemoryQuery(rows, { search: 'ali' })
    expect(result.items.map((r) => r.id)).toEqual(['1'])
  })

  it('sorts ascending and descending by field', () => {
    const asc = runInMemoryQuery(rows, { sort: { field: 'name', direction: 'asc' } })
    expect(asc.items.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie', 'Dana'])

    const desc = runInMemoryQuery(rows, { sort: { field: 'name', direction: 'desc' } })
    expect(desc.items.map((r) => r.name)).toEqual(['Dana', 'Charlie', 'Bob', 'Alice'])
  })

  it('combines exact filter, sort, and pagination together', () => {
    const result = runInMemoryQuery(rows, {
      filters: { status: 'active' },
      exactFilterFields: ['status'],
      sort: { field: 'name', direction: 'desc' },
      page: 1,
      pageSize: 2,
    })
    expect(result.items.map((r) => r.name)).toEqual(['Dana', 'Charlie'])
    expect(result.total).toBe(3)
  })
})
