import { removeOldNotifications } from '../modules/notifications/notifications-repository'
import { init } from '../../services/cron/init'

const cronTime = '0 3 * * 0'
init(__filename, cronTime, removeOldNotifications)
