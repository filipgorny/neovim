import * as R from 'ramda'
import asAsync from '../../../../utils/function/as-async'
import { fetchBookProgressAllCourses } from '../../student-books/student-book-repository'
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

const groupBooksByCourse = input => {
  const grouped = []

  R.pipe(
    R.prop('data'),
    R.groupBy(makeGroupingKey),
    R.forEachObjIndexed(
      (books, title) => {
        grouped.push({
          title: extractTitle(title),
          books,
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
    async () => fetchBookProgressAllCourses(studentId),
    groupBooksByCourse,
  ])(query)
)
