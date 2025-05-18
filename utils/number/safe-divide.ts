import * as R from 'ramda'

export const safeDivide = R.curry(
  (a: number, b: number): number => (
    R.ifElse(
      R.equals(0),
      R.always(0),
      R.divide(a)
    )(b)
  )
)
