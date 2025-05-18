import R from 'ramda'
import { findExams } from '../exam-repository'

const hydrateItem = R.pipe(
  R.map(
    R.evolve({
      exam_length: JSON.parse,
    })
  )
)

export default async (query, user) => {
  return R.pipeWith(R.andThen)([
    findExams,
    R.over(
      R.lensProp('data'),
      hydrateItem
    ),
  ])(query, query.filter)
}
