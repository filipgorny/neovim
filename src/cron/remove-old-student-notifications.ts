import { removeOldStudentNotifications } from '../modules/student-notifications/student-notifications-repository'
import { init } from '../../services/cron/init'

const cronTime = '15 3 * * 0'
init(__filename, cronTime, removeOldStudentNotifications)
