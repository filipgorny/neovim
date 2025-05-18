import * as R from 'ramda'

export const areStringsSame = R.curry((a, b) => (
  R.pipe(
    R.toLower,
    R.equals(
      R.toLower(b)
    )
  )(a)
))
