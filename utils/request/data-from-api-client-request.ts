import R from 'ramda'
import jwt from 'jsonwebtoken'
import { tokenExpiredException, unknownApiClientException } from '../error/error-factory'
import env from '../env'

/**
 * Map of registered (i.e. allowed) API clients, with their API keys
 */
const allowedClientKeyMap = {
  gladiators: env('API_CLIENT_GLADIATORS'),
}

const parseToken = clientName => token => {
  let payload

  const apiKey = R.prop(clientName)(allowedClientKeyMap)

  if (!apiKey) {
    throw unknownApiClientException()
  }

  try {
    payload = jwt.verify(token, allowedClientKeyMap[clientName])

    return payload
  } catch (e) {
    throw tokenExpiredException()
  }
}

const dataFromApiClientRequest = request => {
  const clientName = R.pathOr(null, ['headers', 'x-client-name'])(request)

  return R.pipe(
    R.pathOr(null, ['headers', 'x-client-authorization']),
    R.unless(
      R.equals(null),
      R.pipe(
        R.split(' '),
        R.last,
        parseToken(clientName),
        R.always(clientName)
      )
    )
  )(request)
}

export default dataFromApiClientRequest
