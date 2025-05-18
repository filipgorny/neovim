import R from 'ramda'
import { notFoundException, throwException } from '../../../../utils/error/error-factory'

export const validateQuestionBelongsToStudent = studentId => R.pipe(
  R.path(['passage', 'section', 'exam', 'student_id']),
  R.unless(
    R.equals(studentId),
    () => throwException(notFoundException('StudentExamQuestion'))
  )
)
