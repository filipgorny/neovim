import sha1 from 'sha1'
import log4js from 'log4js'
import logger from './logger'

/**
 * Registry of running jobs
 */
const jobs = {}

/**
 * Log a job start, adds the job to the registry
 *
 * @param {string} job_name (unique for the application name of the job)
 * @param {string} job_kind (cron|worker)
 * @returns jobID
 */
function start (job_name: string, job_kind: string = 'cron'): string {
  const jobID = _jobLog(job_name, undefined, 'start', '', 'info', job_kind)
  jobs[jobID] = {
    job_name: job_name,
    job_kind: job_kind,
    job_start_time: new Date(),
  }

  // Hack: Delay next code execution for ~10ms to log the job start before any other code
  const start = Date.now()
  let i = 0
  while (Date.now() - start < 10) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    i++
  }

  return jobID
}

/**
 * Log a job end
 */
function end (): void {
  const jobID = _getLastID()
  const job = jobs[jobID]

  if (job === undefined) {
    throw new Error(`Job id ${jobID} not found in job registry, maybe you already called end() for this job?`)
  }

  const job_duration = Math.round((+new Date() - job.job_start_time) / 100) / 10
  _jobLog(job.job_name, jobID, 'end', [], 'info', job.job_kind, job_duration)

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete jobs[jobID]
}

/**
 * Returns the last job id
 * @private
 * @returns last job id or undefined if no job was started
 */
function _getLastID (): string {
  return Object.keys(jobs).pop()
}

/**
 * Log a job start or end or failure
 */
function _jobLog (
  jobName: string,
  jobID: string,
  jobOperation: string,
  jobMessages: any[] | string = [],
  logLevel: string = 'info',
  jobKind: string = 'cron',
  jobDuration?: number
): string {
  if (jobID === undefined && jobOperation === 'start') {
    jobID = sha1(`${Date()}${jobName}${Math.random()}`)
  }

  const gelf = {
    GELF: true,
    _job_name: jobName,
    _job_id: jobID,
    _job_operation: jobOperation,
    _job_kind: jobKind,
    _job_duration: undefined,
  }

  const joblogger = log4js.getLogger('jobs')

  if (jobOperation === 'end') {
    gelf._job_duration = jobDuration
    joblogger.info(gelf, `Job ${jobName}, kind ${jobKind} ended with id ${jobID} in ${jobDuration}s`)
  } else if (jobOperation === 'start') {
    joblogger.info(gelf, `Job ${jobName}, kind ${jobKind} started with id ${jobID}`)
  } else if (jobOperation === 'log') {
    joblogger[logLevel](gelf, ...jobMessages)
  }

  return jobID
}

/**
 * Wrapper for log4js log functions (debug, info, warn, error)
 */
function _logWrapper (level: string, ...args: any[]): string {
  let jobID = _getLastID()
  let job = jobs[jobID]

  if (job === undefined) {
    job = {
      job_name: undefined,
      job_kind: undefined,
    }
    jobID = undefined
  }

  return _jobLog(job.job_name, jobID, 'log', [...args], level, job.job_kind)
}

/**
 * Initialize the job logger
 */
function init (): { debug: Function; info: Function; warn: Function; error: Function; start: Function; end: Function } {
  return {
    debug: _logWrapper.bind(logger, 'debug'),
    info: _logWrapper.bind(logger, 'info'),
    warn: _logWrapper.bind(logger, 'warn'),
    error: _logWrapper.bind(logger, 'error'),
    start: start,
    end: end,
  }
}

export default init()
