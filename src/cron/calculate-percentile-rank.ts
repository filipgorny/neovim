import { calculatePercentileRank } from '../../services/percentile-rank/calculate-sections-percentile-rank'
import { init } from '../../services/cron/init'

/**
 * calculating percentile ranks for types that are already valid for calculations
 */
const cronTime = '30 0 * * 6'
init(__filename, cronTime, calculatePercentileRank)
