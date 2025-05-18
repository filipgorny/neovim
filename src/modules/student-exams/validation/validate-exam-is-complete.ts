import R from 'ramda'
import { examIsNotCompletedException, throwException } from '../../../../utils/error/error-factory'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../student-exams/student-exam-statuses'

export const validateExamIsCompleted = exam => (
  R.pipe(
    R.prop('status'),
    R.unless(
      R.equals(STUDENT_EXAM_STATUS_COMPLETED),
      () => throwException(examIsNotCompletedException())
    )
  )(exam)
)
