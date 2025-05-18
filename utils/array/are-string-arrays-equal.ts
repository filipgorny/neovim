import * as R from 'ramda'

const prepareArray = R.pipe(
  R.map(R.toLower),
  R.sortBy(R.identity)
)

export const areStringArraysEqual = R.curry(
  (a, b) => (
    R.pipe(
      prepareArray,
      R.equals(prepareArray(b))
    )(a)
  )
)
