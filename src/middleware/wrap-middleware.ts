import { wrap } from 'express-promise-wrap'

/**
 * Wraps a middleware function to be used in Express. The function itself does not need to use next().
 * It also increases the readability of the code.
 */
export const wrapMiddleware = (fn: Function) => wrap(async (req, res, next) => {
  await fn(req, res)

  return next()
})
