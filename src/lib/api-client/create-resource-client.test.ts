import { describe, it, expect, beforeEach } from 'vitest'
import { createResourceClient } from './create-resource-client'

interface WidgetRaw {
  id: string
  widget_name: string
}
interface Widget {
  id: string
  name: string
}

function makeClient(seed: WidgetRaw[]) {
  return createResourceClient<WidgetRaw, Widget>({
    resource: '/widgets',
    mockData: seed,
    transform: (raw) => ({ id: raw.id, name: raw.widget_name }),
    toRaw: (partial) => ({
      ...(partial.name !== undefined && { widget_name: partial.name }),
    }),
  })
}

describe('createResourceClient (mock mode)', () => {
  let seed: WidgetRaw[]

  beforeEach(() => {
    seed = [
      { id: 'w1', widget_name: 'Alpha' },
      { id: 'w2', widget_name: 'Beta' },
    ]
  })

  it('lists items transformed to the FE shape', async () => {
    const client = makeClient(seed)
    const result = await client.list({})
    expect(result.total).toBe(2)
    expect(result.items).toEqual([
      { id: 'w1', name: 'Alpha' },
      { id: 'w2', name: 'Beta' },
    ])
  })

  it('gets a single item by id', async () => {
    const client = makeClient(seed)
    const widget = await client.getById('w2')
    expect(widget).toEqual({ id: 'w2', name: 'Beta' })
  })

  it('throws for a missing id', async () => {
    const client = makeClient(seed)
    await expect(client.getById('missing')).rejects.toThrow()
  })

  it('creates a new item and returns it transformed', async () => {
    const client = makeClient(seed)
    const created = await client.create({ name: 'Gamma' })
    expect(created.name).toBe('Gamma')

    const listed = await client.list({})
    expect(listed.total).toBe(3)
  })

  it('updates an existing item in place', async () => {
    const client = makeClient(seed)
    const updated = await client.update('w1', { name: 'Alpha Renamed' })
    expect(updated.name).toBe('Alpha Renamed')

    const fetched = await client.getById('w1')
    expect(fetched.name).toBe('Alpha Renamed')
  })

  it('removes an item', async () => {
    const client = makeClient(seed)
    await client.remove('w1')

    const result = await client.list({})
    expect(result.total).toBe(1)
    expect(result.items.map((w) => w.id)).toEqual(['w2'])
  })
})

describe('createResourceClient (mock mode) without toRaw', () => {
  it('falls back to a naive field merge — only correct when raw and FE field names match', async () => {
    // No `toRaw` provided: create/update payloads are merged onto the
    // raw record as-is. Since `Widget.name` and `WidgetRaw.widget_name`
    // don't match, the write silently lands on the wrong field — this
    // is exactly why every real module in this app provides `toRaw`.
    const client = createResourceClient<WidgetRaw, Widget>({
      resource: '/widgets',
      mockData: [{ id: 'w1', widget_name: 'Alpha' }],
      transform: (raw) => ({ id: raw.id, name: raw.widget_name }),
    })

    const updated = await client.update('w1', { name: 'Alpha Renamed' })
    expect(updated.name).toBe('Alpha') // unchanged — the write missed widget_name
  })
})
