import { rescheduleIncompleteEvents } from '../../services/student-calendar-events/reschedule-incomplete-events'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Reschedule incomplete calendar events')

  await rescheduleIncompleteEvents()

  console.log('Done')

  process.exit(0)
})()
