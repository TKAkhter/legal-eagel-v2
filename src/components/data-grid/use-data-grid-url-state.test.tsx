import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useDataGridUrlState } from './use-data-grid-url-state'

function wrapper(initialPath: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  }
}

describe('useDataGridUrlState', () => {
  it('applies the configured defaultSort when the URL has no sort params', () => {
    const { result } = renderHook(() => useDataGridUrlState(10, { field: 'createdAt', direction: 'desc' }), {
      wrapper: wrapper('/audit-log'),
    })
    expect(result.current.params.sort).toEqual({ field: 'createdAt', direction: 'desc' })
  })

  it('lets an explicit URL sort override the configured defaultSort', () => {
    const { result } = renderHook(
      () => useDataGridUrlState(10, { field: 'createdAt', direction: 'desc' }),
      { wrapper: wrapper('/audit-log?sortField=actorName&sortDir=asc') },
    )
    expect(result.current.params.sort).toEqual({ field: 'actorName', direction: 'asc' })
  })

  it('has no sort when neither the URL nor a defaultSort is provided', () => {
    const { result } = renderHook(() => useDataGridUrlState(10), { wrapper: wrapper('/leads') })
    expect(result.current.params.sort).toBeNull()
  })
})
