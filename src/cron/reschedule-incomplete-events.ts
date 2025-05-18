import { init } from '../../services/cron/init'
import { rescheduleIncompleteEvents } from '../../services/student-calendar-events/reschedule-incomplete-events'

/**
 * Reschecdule incomplete calendar events
 */
const cronTime = '30 2 * * *'
init(__filename, cronTime, rescheduleIncompleteEvents)
