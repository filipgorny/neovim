import * as R from 'ramda'

const calculateAverage = R.pipe(
  R.juxt([
    R.sum,
    R.prop('length'),
  ]),
  R.apply(R.divide)
)

export const average = R.ifElse(
  R.propEq('length', 0),
  R.always(0),
  calculateAverage
)
