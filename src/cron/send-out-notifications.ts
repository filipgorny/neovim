import { sendOutNotifications } from '../modules/notifications/notifications-service'
import { POLLING_DELAY_IN_MINUTES } from '../constants'
import { init } from '../../services/cron/init'

const cronTime = `*/${POLLING_DELAY_IN_MINUTES} * * * *`
init(__filename, cronTime, sendOutNotifications)
