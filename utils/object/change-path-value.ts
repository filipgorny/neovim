import * as R from 'ramda'

export const changePathValue = R.curry(
  (path: string[], fn: Function, item: any) => (
    R.over(
      R.lensPath(path),
      fn,
      item
    )
  )
)
