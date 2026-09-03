import { httpClient } from './http-client'
import { runInMemoryQuery } from './in-memory-query'
import { featureFlags } from '@/lib/feature-flags'
import type { PagedResult, QueryParams } from './types'

interface ResourceClientConfig<TRaw, T> {
  /** API path, e.g. '/leads'. Used both as the real endpoint and the mock-data label. */
  resource: string
  /** Static demo dataset used while `featureFlags.useMockData` is true. */
  mockData: TRaw[]
  /**
   * Maps a raw record (mock fixture shape OR real API response shape)
   * into the shape the frontend actually consumes. This is the whole
   * point of the data layer: components only ever see `T`, never `TRaw`,
   * so a backend field rename/reshape only touches this one function.
   */
  transform: (raw: TRaw) => T
  /**
   * Reverse of `transform` — maps an FE-shaped create/update payload
   * back into raw field names, so mock `create`/`update` actually land
   * on the right fields instead of silently writing FE field names
   * (e.g. `name`) onto a raw record that expects something else (e.g.
   * `full_name`). Omit only when `TRaw` and `T` share identical field
   * names; otherwise create/update will silently drop data in mock mode.
   * A real backend doesn't need this — it receives the FE payload as
   * JSON and applies its own mapping server-side.
   */
  toRaw?: (partial: Partial<T>) => Partial<TRaw>
}

/**
 * Creates the `{ list, getById, create, update, remove }` API for one
 * module. Every module's `api/` folder should be a thin wrapper around
 * this — see `modules/leads/api/leads-api.ts` for the pattern.
 */
export function createResourceClient<TRaw extends { id: string }, T extends { id: string }>(
  config: ResourceClientConfig<TRaw, T>,
) {
  const { resource, mockData, transform, toRaw } = config
  const applyToRaw = toRaw ?? ((partial: Partial<T>) => partial as unknown as Partial<TRaw>)

  async function list(params: QueryParams = {}): Promise<PagedResult<T>> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const raw = runInMemoryQuery(mockData, params)
      return { ...raw, items: raw.items.map(transform) }
    }

    const { data } = await httpClient.get<PagedResult<TRaw>>(resource, { params })
    return { ...data, items: data.items.map(transform) }
  }

  async function getById(id: string): Promise<T> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const match = mockData.find((r) => r.id === id)
      if (!match) throw new Error(`${resource}/${id} not found`)
      return transform(match)
    }

    const { data } = await httpClient.get<TRaw>(`${resource}/${id}`)
    return transform(data)
  }

  async function create(payload: Partial<T>): Promise<T> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const raw = { id: `${resource}-${Date.now()}`, ...applyToRaw(payload) } as TRaw
      mockData.unshift(raw)
      return transform(raw)
    }
    const { data } = await httpClient.post<TRaw>(resource, payload)
    return transform(data)
  }

  async function update(id: string, payload: Partial<T>): Promise<T> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const idx = mockData.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error(`${resource}/${id} not found`)
      mockData[idx] = { ...mockData[idx], ...applyToRaw(payload) } as TRaw
      return transform(mockData[idx])
    }
    const { data } = await httpClient.patch<TRaw>(`${resource}/${id}`, payload)
    return transform(data)
  }

  async function remove(id: string): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const idx = mockData.findIndex((r) => r.id === id)
      if (idx !== -1) mockData.splice(idx, 1)
      return
    }
    await httpClient.delete(`${resource}/${id}`)
  }

  return { list, getById, create, update, remove }
}

function simulateLatency() {
  return new Promise((r) => setTimeout(r, 250 + Math.random() * 250))
}
