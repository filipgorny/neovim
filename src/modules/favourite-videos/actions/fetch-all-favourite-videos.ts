import * as R from 'ramda'
import { find } from '../favourite-videos-repository'

export default async (student) => (
  R.pipeWith(R.andThen)([
    async () => find({ limit: { page: 1, take: 1000 }, order: { dir: 'asc', by: 'id' } }, { student_id: student.id }),
  ])(true)
)
