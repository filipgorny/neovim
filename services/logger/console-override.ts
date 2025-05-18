/**
 * Override console.log to use the logger
*/

import logger from './logger'
const override = ['log', 'debug', 'info', 'warn', 'error']

// console.log(logger)

override.forEach((level) => { console[level] = logger[level].bind(logger) })
