import { evaluateScoreCalculationsEnabled } from '../../services/exam-types/evaluate-score-calculations-enabled'
import { init } from '../../services/cron/init'

/**
 * check if the status is changed for the types that have the calculations disabled a fixed number of exams
 * have to be completed to unlock calculations
 */
const cronTime = '15 0 * * 6'
init(__filename, cronTime, evaluateScoreCalculationsEnabled)
