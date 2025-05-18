import { customException, throwException } from '@desmart/js-utils'
import * as R from 'ramda'

export const validatePinBelongsToStudent = (studentId: string) => R.unless(
  R.pathSatisfies(R.equals(studentId), ['content', 'subchapter', 'chapter', 'book', 'student_id']),
  () => throwException(customException('student-book-content-pin.forbidden', 403, 'Pin note does not belong to student'))
)
