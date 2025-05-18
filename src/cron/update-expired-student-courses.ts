import { updateExpiredStudentCourses } from '../../services/student-course/expire-course'
import { init } from '../../services/cron/init'

const cronTime = '10 0 * * *'
init(__filename, cronTime, updateExpiredStudentCourses)
