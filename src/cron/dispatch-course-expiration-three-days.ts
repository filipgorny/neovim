import { dispatchCourseExpirationThreeDays } from '../../services/student-course/dispatch-course-expiration-notifications'
import { init } from '../../services/cron/init'

const cronTime = '0 1 * * *'
init(__filename, cronTime, dispatchCourseExpirationThreeDays)
