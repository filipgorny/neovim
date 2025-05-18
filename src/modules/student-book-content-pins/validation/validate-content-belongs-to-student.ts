import { customException, throwException } from '@desmart/js-utils'
import * as R from 'ramda'

export const validateContentBelongsToStudent = (studentId: string) => R.unless(
  R.pathSatisfies(R.equals(studentId), ['subchapter', 'chapter', 'book', 'student_id']),
  () => throwException(customException('student-book-content.forbidden', 403, 'Content does not belong to student'))
)
