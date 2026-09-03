import { describe, it, expect } from 'vitest'
import { env } from './env'

describe('env', () => {
  it('loads without throwing and parses the numeric undo-window setting', () => {
    // This mirrors the real .env.local shipped with the boilerplate.
    // The important thing here isn't the exact number — it's that
    // `env` module import didn't throw. See the empty-string handling
    // note on `optionalUrl`/`optionalPositiveInt` in env.ts: Vite gives
    // unset vars as `""`, and a naive `z.coerce.number()` turns `""`
    // into `0`, which then fails `.positive()` — this test would fail
    // loudly (via the throw in loadEnv) if that regressed.
    expect(env.VITE_UNDO_WINDOW_MS).toBeGreaterThan(0)
    expect(Number.isInteger(env.VITE_UNDO_WINDOW_MS)).toBe(true)
  })

  it('parses feature flags as real booleans, not the literal strings', () => {
    expect(typeof env.VITE_FEATURE_USE_MOCK_DATA).toBe('boolean')
  })
})
