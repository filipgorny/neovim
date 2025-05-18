import { calculateOilLevel } from '../../services/completion-meter/oil-service'
import { init } from '../../services/cron/init'
/**
 * Completion meter (dashboard)
 */
const cronTime = '0 2 * * *'
init(__filename, cronTime, calculateOilLevel)
