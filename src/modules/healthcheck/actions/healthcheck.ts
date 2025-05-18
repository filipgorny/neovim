import * as R from 'ramda'
import orm from '../../../models'
import vimeoHealthCheck from '../../../../services/vimeo/vimeo-healthcheck'
import s3HealthCheck from '../../../../services/s3/s3-healthcheck'
import socketServersHealthCheck from '../../../../services/socket-servers/socket-servers-healthcheck'
// import { getGameApiClient } from '../../../../services/game-http-client/client'
import { customException, throwException } from '@desmart/js-utils'
import env from '../../../../utils/env'

const { bookshelf } = orm

const dbHealthCheck = ({ knex }) => (
  knex.raw('select 1+1 as result')
    .then(() => true)
    .catch(() => false)
)

const validateQueryKey = (query: {}) => {
  R.unless(
    R.propEq('HEALTHCHECK_KEY', env('HEALTHCHECK_KEY')),
    () => throwException(customException('healthcheck.invalid-key', 403, 'Healthcheck key invalid'))
  )(query)
}

const gameClientHealthCheck = async () => {
  /**
   * Check disabled as the project is currently not in use
   */
  return true
  // getGameApiClient('gladiators', {}).get('/')
  //   .then(res => {
  //     return R.propSatisfies((x: number) => x === 200, 'status', res)
  //   })
  //   .catch(e => {
  //     console.log(e)

  //     return false
  //   })
}

export const healthCheck = async (query: {}) => {
  validateQueryKey(query)

  const [
    dbCheck,
    vimeoCheck,
    s3Check,
    socketServersCheck,
  ] = await Promise.all([
    dbHealthCheck(bookshelf),
    vimeoHealthCheck(),
    s3HealthCheck(),
    socketServersHealthCheck(),
  ])

  return {
    postgres: dbCheck,
    vimeo: vimeoCheck,
    s3: s3Check,
    'socket-servers': socketServersCheck,
    // gameApi: gameCheck,
    _allgood: dbCheck && vimeoCheck && s3Check && socketServersCheck,
  }
}
