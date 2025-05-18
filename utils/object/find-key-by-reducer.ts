/**
 * See test suite for example usage.
 */

import * as R from 'ramda'

export const findKeyByReducer = (reducer, acc) => R.pipe(
  R.toPairs,
  R.reduce(
    reducer,
    acc
  ),
  R.head
)
