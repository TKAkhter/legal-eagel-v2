import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DayEntriesDialog } from './DayEntriesDialog'
import type { CalendarEntry } from './types'

interface CalendarProps {
  entries: CalendarEntry[]
  onEntryClick?: (entry: CalendarEntry) => void
}

/**
 * Pass `entries` in and this handles the rest: rendering them on the
 * grid, and — per the "click a date to see a table of what's on it"
 * requirement — opening `DayEntriesDialog` on date click. Used for
 * Matters deadlines, billing due dates, or any other date-anchored data;
 * callers don't need to know FullCalendar's API at all.
 */
export function Calendar({ entries, onEntryClick }: CalendarProps) {
  const theme = useTheme()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const entriesForSelectedDate = selectedDate
    ? entries.filter((e) => e.date.slice(0, 10) === selectedDate)
    : []

  return (
    <Box
      sx={{
        '--fc-border-color': theme.palette.divider,
        '--fc-page-bg-color': theme.palette.background.paper,
        '--fc-neutral-bg-color': theme.palette.action.hover,
        '--fc-today-bg-color': theme.palette.action.selected,
        '.fc': { fontFamily: theme.typography.fontFamily },
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
        height="auto"
        events={entries.map((e) => ({ id: e.id, title: e.title, date: e.date, color: e.color }))}
        dateClick={(info) => setSelectedDate(info.dateStr)}
        eventClick={(info) => {
          const entry = entries.find((e) => e.id === info.event.id)
          if (entry) onEntryClick?.(entry)
        }}
      />

      <DayEntriesDialog
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        entries={entriesForSelectedDate}
        onEntryClick={onEntryClick}
      />
    </Box>
  )
}
