import * as R from 'ramda'

/**
 * Simpler implementation of R.invoker.
 */
export const invoke = (method, argNr = 0, ...args) => data => (
  R.invoker(argNr, method)(...args, data)
)
