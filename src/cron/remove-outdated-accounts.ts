import { removeOutdatedAccounts } from '../../services/students/remove-outdated-accounts'
import { init } from '../../services/cron/init'

/**
 * Outdated student accounts
 */
const cronTime = '*/15 * * * *'
init(__filename, cronTime, removeOutdatedAccounts)
