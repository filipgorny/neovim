import R from 'ramda'
import { findExams } from '../../student-exams/student-exam-repository'

const hydrateItem = R.evolve({
  exam_length: JSON.parse,
})

export default async (id, query) => (
  R.pipeWith(R.andThen)([
    async () => findExams(id, query, query.filter, true),
    R.over(
      R.lensProp('data'),
      R.map(hydrateItem)
    ),
  ])(true)
)
