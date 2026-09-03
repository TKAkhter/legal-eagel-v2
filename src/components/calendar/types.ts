export interface CalendarEntry {
  id: string
  title: string
  date: string // ISO date (YYYY-MM-DD) or datetime
  color?: string
  /** Arbitrary extra fields the "entries table" for a day can render as columns. */
  meta?: Record<string, string>
}
