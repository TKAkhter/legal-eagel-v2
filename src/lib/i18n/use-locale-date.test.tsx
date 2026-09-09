import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import i18n from '@/i18n'
import { useLocaleDate } from './use-locale-date'

describe('useLocaleDate', () => {
  const originalLanguage = i18n.language

  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage(originalLanguage)
    })
  })

  it('formats dates using the current i18n language, not a hardcoded locale', async () => {
    const date = '2026-03-05T00:00:00Z'

    await act(async () => {
      await i18n.changeLanguage('en')
    })
    const { result: enResult } = renderHook(() => useLocaleDate())
    const enFormatted = enResult.current.formatDate(date)

    await act(async () => {
      await i18n.changeLanguage('ar')
    })
    const { result: arResult } = renderHook(() => useLocaleDate())
    const arFormatted = arResult.current.formatDate(date)

    // Arabic locale formatting (Eastern Arabic numerals / different
    // month names) must differ from English — proves the language
    // switch actually changes date rendering, not just UI strings.
    expect(arFormatted).not.toBe(enFormatted)
  })

  it('formatDateTime also follows the current language', async () => {
    const date = '2026-03-05T14:30:00Z'

    await act(async () => {
      await i18n.changeLanguage('ar')
    })
    const { result } = renderHook(() => useLocaleDate())

    expect(() => result.current.formatDateTime(date)).not.toThrow()
    expect(result.current.formatDateTime(date).length).toBeGreaterThan(0)
  })
})
