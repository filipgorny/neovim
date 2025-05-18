import { calculateTemperature } from '../../services/completion-meter/temperature-service'
import { init } from '../../services/cron/init'

/**
 * Completion meter (dashboard)
 */
const cronTime = '0 23 * * *'
init(__filename, cronTime, calculateTemperature)
