import { dispatchExamExpiredToday } from '../../services/student-exams/dispatch-expiration-notifications'
import { init } from '../../services/cron/init'

const cronTime = '59 23 * * *'
init(__filename, cronTime, dispatchExamExpiredToday)
