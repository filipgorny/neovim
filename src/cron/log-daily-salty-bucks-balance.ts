import { logDailySaltyBucksBalance } from '../../services/salty-bucks/log-daily-balance'
import { init } from '../../services/cron/init'

const cronTime = '5 0 * * *'
init(__filename, cronTime, logDailySaltyBucksBalance)
