import R from 'ramda'
import { find } from '../layout-repository'

export default async query => R.pipeWith(R.andThen)([
  find,
  // @ts-ignore
])(query, query.filter)
