import * as R from 'ramda'
import asAsync from '../../../../utils/function/as-async'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../../student-courses/student-course-repository'

const defaultQuery = ({
  order: {
    by: 'external_created_at',
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

const findCourses = (studentId: string) => async (query) => (
  find(query, { student_id: studentId, is_deleted: false }, ['endDate'])
)

const transformMetadata = R.over(
  R.lensProp('data'),
  R.pipe(
    collectionToJson,
    R.map(
      R.evolve({
        metadata: JSON.parse,
      })
    )
  )
)

export default async (studentId: string, query) => (
  R.pipeWith(R.andThen)([
    asAsync(prepareQuery),
    findCourses(studentId),
    transformMetadata,
  ])(query)
)
