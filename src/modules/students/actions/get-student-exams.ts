import * as R from 'ramda'
import asAsync from '../../../../utils/function/as-async'
import { findExams } from '../../student-exams/student-exam-repository'
import { extractTitle, makeGroupingKey } from './helpers/get-student-items-helpers'

const defaultQuery = ({
  order: {
    by: 'created_at',
    dir: 'desc',
  },
  limit: {
    page: 1,
    take: 100,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

const getCourseTitle = title => title === '|-' ? 'Standalone' : extractTitle(title)

const groupExamsByCourse = (input) => {
  const grouped = []

  R.pipe(
    R.prop('data'),
    R.groupBy(makeGroupingKey),
    R.forEachObjIndexed(
      (exams, title) => {
        grouped.push({
          title: getCourseTitle(title),
          exams,
        })
      }
    )
  )(input)

  return R.evolve({
    data: R.always(grouped),
  })(input)
}

export default async (studentId: string, query) => (
  R.pipeWith(R.andThen)([
    asAsync(prepareQuery),
    async () => findExams(studentId, query, query.filter, false, undefined, true),
    groupExamsByCourse,
  ])(query)
)
