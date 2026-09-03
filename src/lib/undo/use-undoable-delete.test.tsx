import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, renderHook, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/feedback/ToastProvider'
import { useUndoableDelete } from './use-undoable-delete'
import { env } from '@/lib/env'
import type { PagedResult } from '@/lib/api-client/types'

interface Row {
  id: string
  name: string
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

describe('useUndoableDelete', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  it('optimistically removes the row from the cache immediately', () => {
    vi.useFakeTimers()
    seedCache(queryClient, [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }])
    const removeFn = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(
      () => useUndoableDelete<Row>({ queryKeyPrefix: 'leads', removeFn, getLabel: (r) => r.name }),
      { wrapper: makeWrapper(queryClient) },
    )

    act(() => {
      result.current.deleteWithUndo({ id: '1', name: 'Alice' })
    })

    const cached = queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])
    expect(cached?.items.map((r) => r.id)).toEqual(['2'])
    expect(removeFn).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('calls the real remove function once the undo window passes', async () => {
    vi.useFakeTimers()
    seedCache(queryClient, [{ id: '1', name: 'Alice' }])
    const removeFn = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(
      () => useUndoableDelete<Row>({ queryKeyPrefix: 'leads', removeFn, getLabel: (r) => r.name, undoWindowMs: 5000 }),
      { wrapper: makeWrapper(queryClient) },
    )

    act(() => {
      result.current.deleteWithUndo({ id: '1', name: 'Alice' })
    })

    expect(removeFn).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5001)
    })

    expect(removeFn).toHaveBeenCalledWith('1')
    vi.useRealTimers()
  })

  it('never calls remove and restores the row when Undo is clicked', async () => {
    seedCache(queryClient, [{ id: '1', name: 'Alice' }])
    const removeFn = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    function TestComponent() {
      const { deleteWithUndo } = useUndoableDelete<Row>({
        queryKeyPrefix: 'leads',
        removeFn,
        getLabel: (r) => r.name,
        undoWindowMs: 200,
      })
      return <button onClick={() => deleteWithUndo({ id: '1', name: 'Alice' })}>Delete</button>
    }

    render(<TestComponent />, { wrapper: makeWrapper(queryClient) })

    await user.click(screen.getByText('Delete'))
    expect(queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])?.items).toEqual([])

    await user.click(await screen.findByText('Undo'))

    // Give the deferred timer a chance to have fired if the cancellation didn't work.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300))
    })

    expect(removeFn).not.toHaveBeenCalled()
  })

  it('does not touch a detail-page cache entry sharing the same query key prefix', () => {
    // A detail page caches a single record under ['leads', id] — same
    // prefix as the grid's ['leads', params], but a totally different
    // shape (no `.items`). The list-hiding logic must not touch it.
    seedCache(queryClient, [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }])
    queryClient.setQueryData(['leads', '1'], { id: '1', name: 'Alice' })
    const removeFn = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(
      () => useUndoableDelete<Row>({ queryKeyPrefix: 'leads', removeFn, getLabel: (r) => r.name }),
      { wrapper: makeWrapper(queryClient) },
    )

    expect(() => {
      act(() => {
        result.current.deleteWithUndo({ id: '1', name: 'Alice' })
      })
    }).not.toThrow()

    // Detail cache entry is untouched — still the plain record, not mangled.
    expect(queryClient.getQueryData(['leads', '1'])).toEqual({ id: '1', name: 'Alice' })
    // List cache entry did get the row removed.
    expect(queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])?.items).toEqual([{ id: '2', name: 'Bob' }])
  })

  it('defaults the undo window from env.VITE_UNDO_WINDOW_MS when not overridden', async () => {
    vi.useFakeTimers()
    seedCache(queryClient, [{ id: '1', name: 'Alice' }])
    const removeFn = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(
      () => useUndoableDelete<Row>({ queryKeyPrefix: 'leads', removeFn, getLabel: (r) => r.name }),
      { wrapper: makeWrapper(queryClient) },
    )

    act(() => {
      result.current.deleteWithUndo({ id: '1', name: 'Alice' })
    })

    // Just before the env-configured window closes, nothing has committed yet.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(env.VITE_UNDO_WINDOW_MS - 100)
    })
    expect(removeFn).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(removeFn).toHaveBeenCalledWith('1')
    vi.useRealTimers()
  })
})

describe('useUndoableDelete — bulk', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  it('hides all rows immediately and defers a single batched remove call', async () => {
    vi.useFakeTimers()
    seedCache(queryClient, [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Cara' },
    ])
    const removeFn = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(
      () => useUndoableDelete<Row>({ queryKeyPrefix: 'leads', removeFn, getLabel: (r) => r.name, undoWindowMs: 5000 }),
      { wrapper: makeWrapper(queryClient) },
    )

    act(() => {
      result.current.deleteManyWithUndo([{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }])
    })

    const cached = queryClient.getQueryData<PagedResult<Row>>(['leads', { page: 1 }])
    expect(cached?.items.map((r) => r.id)).toEqual(['3'])
    expect(removeFn).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5001)
    })

    expect(removeFn).toHaveBeenCalledTimes(2)
    expect(removeFn).toHaveBeenCalledWith('1')
    expect(removeFn).toHaveBeenCalledWith('2')
    vi.useRealTimers()
  })

  it('undoing the batch cancels every pending delete', async () => {
    seedCache(queryClient, [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }])
    const removeFn = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    function TestComponent() {
      const { deleteManyWithUndo } = useUndoableDelete<Row>({
        queryKeyPrefix: 'leads',
        removeFn,
        getLabel: (r) => r.name,
        undoWindowMs: 200,
      })
      return (
        <button onClick={() => deleteManyWithUndo([{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }])}>
          Delete selected
        </button>
      )
    }

    render(<TestComponent />, { wrapper: makeWrapper(queryClient) })

    await user.click(screen.getByText('Delete selected'))
    await user.click(await screen.findByText('Undo'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 300))
    })

    expect(removeFn).not.toHaveBeenCalled()
  })
})
