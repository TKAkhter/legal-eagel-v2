import { describe, it, expect, vi } from 'vitest'
import { render, renderHook, act, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/feedback/ToastProvider'
import { useOptimisticUpdate } from './use-optimistic-update'
import type { PagedResult } from '@/lib/api-client/types'

interface Row {
  id: string
  name: string
  status: string
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    )
  }
}

function seedCache(queryClient: QueryClient, items: Row[]) {
  const page: PagedResult<Row> = { items, total: items.length, page: 1, pageSize: 10 }
  queryClient.setQueryData(['leads', { page: 1 }], page)
}

describe('useOptimisticUpdate — single row', () => {
  it('patches the cache immediately, before the update call resolves', async () => {
    const queryClient = new QueryClient()
    seedCache(queryClient, [{ id: '1', name: 'Alice', status: 'new' }])

    let resolveUpdate: (row: Row) => void = () => {}
    const updateFn = vi.fn(
      () => new Promise<Row>((resolve) => { resolveUpdate = resolve }),
    )

    const { result } = renderHook(
      () => useOptimisticUpdate<Row>({ queryKeyPrefix: 'leads', updateFn }),
      { wrapper: makeWrapper(queryClient) },
    )

    act(() => {
      result.current.updateOptimistic('1', { status: 'contacted' })
    })

    // Cache already shows the new status, even though updateFn hasn't resolved yet.
    const cached = queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])
    expect(cached?.items[0].status).toBe('contacted')

    resolveUpdate({ id: '1', name: 'Alice', status: 'contacted' })
  })

  it('rolls back the cache and shows an error toast when the update fails', async () => {
    const queryClient = new QueryClient()
    seedCache(queryClient, [{ id: '1', name: 'Alice', status: 'new' }])
    const updateFn = vi.fn().mockRejectedValue(new Error('network error'))

    function TestComponent() {
      const { updateOptimistic } = useOptimisticUpdate<Row>({ queryKeyPrefix: 'leads', updateFn })
      return <button onClick={() => updateOptimistic('1', { status: 'contacted' })}>Update</button>
    }

    render(<TestComponent />, { wrapper: makeWrapper(queryClient) })

    await act(async () => {
      screen.getByText('Update').click()
      await new Promise((r) => setTimeout(r, 0))
    })

    const cached = queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])
    expect(cached?.items[0].status).toBe('new')
    expect(await screen.findByText(/couldn't save changes/i)).toBeInTheDocument()
  })

  it('does not touch a detail-page cache entry sharing the same prefix', async () => {
    const queryClient = new QueryClient()
    seedCache(queryClient, [{ id: '1', name: 'Alice', status: 'new' }])
    queryClient.setQueryData(['leads', '1'], { id: '1', name: 'Alice', status: 'new' })
    const updateFn = vi.fn().mockResolvedValue({ id: '1', name: 'Alice', status: 'contacted' })

    const { result } = renderHook(
      () => useOptimisticUpdate<Row>({ queryKeyPrefix: 'leads', updateFn }),
      { wrapper: makeWrapper(queryClient) },
    )

    await act(async () => {
      await result.current.updateOptimistic('1', { status: 'contacted' })
    })

    expect(queryClient.getQueryData(['leads', '1'])).toEqual({ id: '1', name: 'Alice', status: 'new' })
  })
})

describe('useOptimisticUpdate — batch', () => {
  it('patches every matching row immediately', () => {
    const queryClient = new QueryClient()
    seedCache(queryClient, [
      { id: '1', name: 'Alice', status: 'new' },
      { id: '2', name: 'Bob', status: 'new' },
      { id: '3', name: 'Cara', status: 'new' },
    ])
    let resolveAll: () => void = () => {}
    const updateFn = vi.fn(() => new Promise<Row>((resolve) => { resolveAll = () => resolve({ id: '1', name: '', status: 'contacted' }) }))

    const { result } = renderHook(
      () => useOptimisticUpdate<Row>({ queryKeyPrefix: 'leads', updateFn }),
      { wrapper: makeWrapper(queryClient) },
    )

    act(() => {
      result.current.updateManyOptimistic(['1', '2'], { status: 'contacted' })
    })

    const cached = queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])
    expect(cached?.items.map((r) => r.status)).toEqual(['contacted', 'contacted', 'new'])
    resolveAll()
  })

  it('rolls back all rows if any update in the batch fails', async () => {
    const queryClient = new QueryClient()
    seedCache(queryClient, [
      { id: '1', name: 'Alice', status: 'new' },
      { id: '2', name: 'Bob', status: 'new' },
    ])
    const updateFn = vi
      .fn()
      .mockResolvedValueOnce({ id: '1', name: 'Alice', status: 'contacted' })
      .mockRejectedValueOnce(new Error('failed'))

    const { result } = renderHook(
      () => useOptimisticUpdate<Row>({ queryKeyPrefix: 'leads', updateFn }),
      { wrapper: makeWrapper(queryClient) },
    )

    await act(async () => {
      await result.current.updateManyOptimistic(['1', '2'], { status: 'contacted' })
    })

    const cached = queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])
    expect(cached?.items.map((r) => r.status)).toEqual(['new', 'new'])
  })
})
