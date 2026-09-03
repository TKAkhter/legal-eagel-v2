import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import arCommon from './locales/ar/common.json'

export const supportedLanguages = ['en', 'ar'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export const rtlLanguages: SupportedLanguage[] = ['ar']

export function isRtl(lang: string): boolean {
  return rtlLanguages.includes(lang as SupportedLanguage)
}

/**
 * Translation resources are bundled locally for now. In production this
 * repo is meant to point at Tolgee instead (self-hosted, free, has an
 * in-context editing UI translators can use on the running app) —
 * swap this `resources` block for Tolgee's i18next backend plugin
 * (`@tolgee/i18next`) once `VITE_TOLGEE_API_URL` / `VITE_TOLGEE_API_KEY`
 * are set. Keeping the keys/namespace shape below identical to what
 * Tolgee exports means that swap doesn't touch any component code.
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
