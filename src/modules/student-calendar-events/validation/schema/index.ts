import { schema as createCalendarEvent } from './create-calendar-event-schema'
import { schema as createComplexCalendarEvent } from './create-complex-calendar-event-schema'
import { schema as reorderCalendarEvent } from './reorder-calendar-event-schema'
import { schema as updateCalendarEvent } from './update-calendar-event-schema'
import { schema as buildPreReading } from './build-pre-reading-schema'

export default {
  createCalendarEvent,
  createComplexCalendarEvent,
  reorderCalendarEvent,
  updateCalendarEvent,
  buildPreReading,
}
