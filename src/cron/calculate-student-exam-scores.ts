// eslint-disable-next-line @typescript-eslint/no-var-requires
import { calculateStudentExamScores } from '../../services/student-exams/calculate-student-exam-scores'
import { init } from '../../services/cron/init'
/**
 * update all pending student scores for types that became allegedly valid for calculatioons
 */
const cronTime = '15 1 * * 6'
init(__filename, cronTime, calculateStudentExamScores)
