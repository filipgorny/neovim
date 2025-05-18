import log4js from 'log4js'

const graylogHost = process.env.LOG_GRAYLOG_HOST
const graylogPort = process.env.LOG_GRAYLOG_PORT
const graylogHostJobs = process.env.LOG_GRAYLOG_HOST_JOBS
const graylogPortJobs = process.env.LOG_GRAYLOG_PORT_JOBS
const consoleEnabled = process.env.LOG_CONSOLE_ENABLED || 'true'
const pm2InstanceVar = process.env.LOG_PM2_INSTANCE_VAR || 'NODE_APP_INSTANCE'

function _isPM2Enabled(): boolean {
  return _getPM2Instance() !== undefined
}

function _getPM2InstanceVar(): string {
  return pm2InstanceVar
}

function _getPM2Instance(): string {
  return process.env[_getPM2InstanceVar()]
}

function _isGraylogEnabled(): boolean {
  return !!(graylogHost && graylogPort)
}

function _isConsoleEnabled(): boolean {
  return consoleEnabled === 'true'
}

function _shutdownHook(log4js): void {
  function _shutdown(): void {
    try {
      log4js.shutdown(() => process.exit(0))
    } catch (e) { }
  }
  [
    'exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM',
  ].forEach(evt => process.on(evt, _shutdown))
}

function _graylogAppender(): any {
  const customFields = {
    _ci_env: process.env.CI_ENV,
    _ci_project_slug: process.env.CI_PROJECT_SLUG,
  }
  return {
    graylog: {
      type: '@log4js-node/gelf',
      host: graylogHost,
      port: graylogPort,
      customFields: customFields,
      layout: {
        type: 'pattern',
        pattern: process.env.LOG_GRAYLOG_FORMAT || '%m (%f{1}:%M:%l)',
      },
    },
  }
}

function _consoleAppender(): any {
  return {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: process.env.LOG_CONSOLE_FORMAT || '%[[%p] %m (%f{1}:%M:%l)%]',
      },
    },
  }
}

function _jobsAppender(): any {
  return {
    jobs: {
      type: '@log4js-node/gelf',
      host: graylogHostJobs,
      port: graylogPortJobs,
      customFields: {
        _ci_env: process.env.CI_ENV,
        _ci_project_slug: process.env.CI_PROJECT_SLUG,
      },
      layout: {
        type: 'pattern',
        pattern: '%m',
      },
    },
  }
}

function _getAppenders(): any {
  return {
    ..._isConsoleEnabled() ? _consoleAppender() : null,
    ..._isGraylogEnabled() ? _graylogAppender() : null,
  }
}

function _configure(): any {
  const logLevel = process.env.LOG_LEVEL || 'info'
  const logLevelJobs = process.env.LOG_LEVEL_JOBS || 'info'
  const appenders = _getAppenders()
  log4js.configure({
    pm2: _isPM2Enabled(),
    pm2InstanceVar: _getPM2InstanceVar(),
    appenders: { ...appenders, ..._jobsAppender() },
    categories: {
      default: {
        appenders: Object.keys(appenders),
        level: logLevel,
        enableCallStack: true,
      },
      jobs: {
        appenders: _isConsoleEnabled() ? ['jobs', 'console'] : ['jobs'],
        level: logLevelJobs,
      },
    },
  })
  return { logLevel: logLevel, logLevelJobs: logLevelJobs, appenders: appenders }
}

function _init(): ReturnType<typeof log4js.getLogger> {
  const { logLevel, logLevelJobs, appenders } = _configure()
  _shutdownHook(log4js)
  const logger = log4js.getLogger('default')

  logger.info('Log4JS configured')
  logger.debug('Log4JS log level: ', logLevel)
  logger.debug('Log4JS job logger log level: ', logLevelJobs)
  logger.debug('Log4JS appenders: ', Object.keys(appenders))

  _isGraylogEnabled() && logger.debug(`Graylog appender enabled, host: ${graylogHost}, port: ${graylogPort}`)
  _isPM2Enabled() && logger.debug(`PM2 cluster mode enabled, instance (${_getPM2InstanceVar()}): `, _getPM2Instance())

  return logger
}

export default _init()
