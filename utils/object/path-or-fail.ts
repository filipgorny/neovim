import * as R from 'ramda'
import { throwException } from '../error/error-factory'

export const pathOrFail = R.curry(
  (path, error, obj) => (
    R.pipe(
      R.path(path),
      R.when(
        R.isNil,
        () => throwException(error)
      )
    )(obj)
  )
)
