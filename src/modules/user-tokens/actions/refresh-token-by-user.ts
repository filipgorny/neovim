import { randomString } from '@desmart/js-utils'
import { create, find, patch } from '../user-tokens-repository'
import * as R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

export default async (user) => {
  const userTokensData = await find({ limit: { page: 1, take: 10 }, order: { by: undefined, dir: 'asc' } }, { user_id: user.id })

  const userToken = R.pipe(
    R.prop('data'),
    collectionToJson,
    R.head
  )(userTokensData)

  const token = randomString()

  if (userToken) {
    return patch(userToken.id, { token, expires_at: new Date(Date.now() + 5 * 60 * 1000) })
  } else {
    return create({ user_id: user.id, token, expires_at: new Date(Date.now() + 5 * 60 * 1000) })
  }
}
