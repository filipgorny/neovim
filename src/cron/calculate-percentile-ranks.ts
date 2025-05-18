import { calculatePercentileRanks } from '../../services/exam-score-maps/calculate-percentile-ranks'
import { init } from '../../services/cron/init'

const cronTime = '20 0 * * 0'

init(__filename, cronTime, calculatePercentileRanks)
