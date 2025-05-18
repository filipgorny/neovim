import * as R from 'ramda'
import { find } from '../student-pin-variants-repository'

const fetchVariants = student_book_id => async student => (
  find({ limit: { page: 1, take: 10 }, order: { by: 'variant', dir: 'asc' } }, {
    student_id: student.id,
    student_book_id,
  })
)

export default async (student, student_book_id) => (
  R.pipeWith(R.andThen)([
    fetchVariants(student_book_id),
    R.prop('data'),
  ])(student)
)
