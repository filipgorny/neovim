import { findOneOrFail } from '../../student-exam-sections/student-exam-section-repository'
import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { flattenQuestions } from '../../../../services/student-exams/flatten-questions'
import { extractSection } from './helpers/helpers'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../student-exam-statuses'

export default async (student, examId, sectionId) => {
  const section = await findOneOrFail({
    id: sectionId,
    student_exam_id: examId
  }, ['exam.sections.passages.questions.originalQuestion'])

  R.unless(
    R.propEq('status', STUDENT_EXAM_STATUS_COMPLETED),
    () => throwException(customException('Exam must be completed', 403))
  )(section.exam)

  R.unless(
    R.propEq('id', section.exam.student_id),
    () => throwException(customException('Student ID mismatch', 404))
  )(student)

  return R.pipe(
    extractSection(sectionId),
    exam => flattenQuestions(exam, true, true),
    R.head,
    R.prop('questions')
  )(section)
}
