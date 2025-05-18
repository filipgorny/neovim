import R from 'ramda'
import jwt from 'jsonwebtoken'
import { tokenExpiredException } from '../error/error-factory'
import env from '../env'

export const parseToken = token => {
  let payload

  try {
    payload = jwt.verify(token, env('APP_KEY'))

    return payload
  } catch (e) {
    throw tokenExpiredException()
  }
}

export const tokenFromRequest = R.pipe(
  R.pathOr(null, ['headers', 'authorization']),
  R.unless(
    R.equals(null),
    R.pipe(
      R.split(' '),
      R.last
    )
  )
)

export const dataFromRequest = R.pipe(
  tokenFromRequest,
  R.unless(
    R.equals(null),
    parseToken
  )
)

export default dataFromRequest
