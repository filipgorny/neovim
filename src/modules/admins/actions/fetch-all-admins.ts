import R from 'ramda'
import { findAdmins } from '../admin-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

export default async query => R.pipeWith(R.andThen)([
  async () => findAdmins(query, query.filter),
  R.over(
    R.lensProp('data'),
    R.pipe(
      collectionToJson,
      R.map(
        R.omit([
          'password',
          'deleted_at',
          'password_reset_token',
          'password_reset_token_created_at',
        ])
      )
    )
  ),
])(true)
