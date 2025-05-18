import { removeOutdatedExams } from '../../services/student-exams/remove-outdated-exams'
import { init } from '../../services/cron/init'

/**
 * Outdated student exams
 */
const cronTime = '30 3 * * *'
init(__filename, cronTime, removeOutdatedExams)
