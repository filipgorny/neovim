import * as R from 'ramda'
import asAsync from '../../../../utils/function/as-async'
import { findEndDatesByStudentId } from '../../course-end-dates/course-end-dates-repository'

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

export default async (studentId: string, query) => (
  R.pipeWith(R.andThen)([
    asAsync(prepareQuery),
    async () => findEndDatesByStudentId(studentId),
  ])(query)
)
