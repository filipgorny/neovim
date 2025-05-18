import R from 'ramda'
import { throwException } from '../error/error-factory'

export const mapPS = fn => async list => (
  Promise.allSettled(
    R.map(fn)(list)
  )
)

export const extractFirstFulfilledOrThrow = promises => R.pipe(
  R.find(
    R.propEq('status', 'fulfilled')
  ),
  R.when(
    R.isNil,
    // todo: think of throwing bit-masked exceptions
    () => R.pipe(
      R.head,
      R.prop('reason'),
      throwException
    )(promises)
  ),
  R.prop('value')
)(promises)
