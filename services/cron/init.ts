// eslint-disable-next-line @typescript-eslint/no-var-requires
const cron = require('node-cron')
import path from 'path'
import cronstrue from 'cronstrue'
import joblogger from '../logger/joblogger'
import { registerSocketClient } from '../../src/sockets/socket-client'

export const init = (moduleFilename: string, cronTime: string, cronFunc: () => Promise<any>): void => {
  const cronTimeHumanReadable = cronstrue.toString(cronTime)
  const jobName = path.basename(moduleFilename).split('.')[0]

  joblogger.info(`Starting cron ${jobName} ${cronTimeHumanReadable}`)

  cron.schedule(cronTime, async () => {
    joblogger.start(jobName)
    try {
      await cronFunc()
    } catch (error) {
      joblogger.error(error)
    } finally {
      joblogger.end()
    }
  }, {})

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  registerSocketClient()
}
