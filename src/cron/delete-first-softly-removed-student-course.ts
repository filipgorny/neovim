import { deleteFirstSoftlyRemovedStudentCourse } from '../modules/student-courses/student-course-repository'
import { init } from '../../services/cron/init'

/**
 * Student courses
 */
const cronTime = '*/60 * * * *'
init(__filename, cronTime, deleteFirstSoftlyRemovedStudentCourse)
