import * as R from 'ramda'
import axios, { Axios } from 'axios'
import * as jwt from 'jsonwebtoken'
import env from '../../utils/env'
import { customException, throwException } from '@desmart/js-utils'

const TOKEN_EXPIRES_IN = '15m'
const GLADIATORS_GAME = 'gladiators'

export const handleError = err => {
  const e = R.path(['response', 'data', 'error'])(err)

  console.log(err)

  throwException(
    customException(
      R.propOr('general-error', 'errorCode')(e),
      R.propOr('500', 'statusCode')(e),
      R.propOr('Something went wrong', 'message')(e)
    )
  )
}

export const handleResponse = R.prop('data')

export const getHttpClient = () => (
  axios
)

const issueAuthToken = (additional = {}) => {
  return jwt.sign({
    client: 'core_api',
    createdAt: new Date(),
    ...additional,
  }, env('EK_GAMES_AUTH_KEY'), { expiresIn: TOKEN_EXPIRES_IN })
}

export const getGameApiClient = (game: string, customHeaders = {}): Axios => {
  const isDev: boolean = env('NODE_ENV') === 'development'

  return axios.create({
    baseURL: isDev ? `${env(`GAME_${R.toUpper(game)}_API_URL`)}:8090` : env(`GAME_${R.toUpper(game)}_API_URL`),
    headers: {
      'x-client-authorization': issueAuthToken(game),
      'x-api-version': env(`GAME_${R.toUpper(game)}_API_VERSION`) || '1.0',
      'x-client-name': 'core_api',
      ...customHeaders,
    },
  })
}

export const getGladiatorsGameApiClient = (request, customHeaders = {}): Axios => (
  getGameApiClient(GLADIATORS_GAME, {
    ...customHeaders,
    authorization: request.headers.authorization,
  })
)
