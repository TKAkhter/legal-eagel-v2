import { useTranslation } from 'react-i18next'

/**
 * `const { formatDate, formatDateTime } = useLocaleDate()` — use these
 * instead of calling `.toLocaleDateString()`/`.toLocaleString()`
 * directly. Plain `date.toLocaleDateString()` renders in the browser's
 * locale, which silently ignores the in-app language switcher — a user
 * who picks Arabic in the app would still see English-formatted dates
 * if their OS/browser is set to English. These bind formatting to
 * `i18n.language` instead, so dates follow whatever language the user
 * actually chose in the app.
 */
export function useLocaleDate() {
  const { i18n } = useTranslation()

  const formatDate = (date: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    new Date(date).toLocaleDateString(i18n.language, options)

  const formatDateTime = (date: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    new Date(date).toLocaleString(i18n.language, options)

  return { formatDate, formatDateTime }
}
