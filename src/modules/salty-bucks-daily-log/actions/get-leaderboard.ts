import * as R from 'ramda'
import { findLeaderBoard } from '../salty-bucks-daily-log-repository'

const rejectStudentsWithoutActiveProducts = R.reject(
  R.propEq('active_products', 0)
)

export default async (query) => (
  R.pipeWith(R.andThen)([
    findLeaderBoard,
    rejectStudentsWithoutActiveProducts,
    R.take(10),
  ])(query)
)
