import * as R from 'ramda'
import { wrap } from 'express-promise-wrap'
import jwt from 'jsonwebtoken'
import env from '../../utils/env'
import dataFromApiClientRequest from '../../utils/request/data-from-api-client-request'
import { User } from '../models'
import validateAccountIsActive from '../modules/users/validation/validate-account-is-active'
import validateAccountIsVerified from '../modules/users/validation/validate-account-is-verified'
import { notFoundException, throwException, tokenExpiredException } from '../../utils/error/error-factory'

/**
 * Checks if the API client is valid (accepted and has proper credentials)
 */
export const authApiClient = wrap(async (req, res, next) => {
  const clientName = dataFromApiClientRequest(req)

  req.api_client = clientName

  next()
})

const parseToken = token => {
  let payload

  try {
    payload = jwt.verify(token, env('EK_GAMES_AUTH_KEY'))

    return payload
  } catch (e) {
    throw tokenExpiredException()
  }
}

const dataFromRequest = R.pipe(
  R.pathOr(null, ['headers', 'authorization']),
  R.unless(
    R.equals(null),
    R.pipe(
      R.split(' '),
      R.last,
      parseToken
    )
  )
)

/**
 * Checks if the user token is valid and if the user itself has a valid account
 */
export const authApiUser = wrap(async (req, res, next) => {
  const data = dataFromRequest(req)

  let user

  try {
    user = (await User.where({ id: data.id }).fetch({ withRelated: ['student'] })).toJSON()
  } catch (e) {
    throwException(notFoundException('User'))
  }

  validateAccountIsActive(user)
  validateAccountIsVerified(user)

  req.user = user

  next()
})
