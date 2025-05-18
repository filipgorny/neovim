import R from 'ramda'
import { findOneOrFail } from '../student-exam-section-repository'
import { throwException, sectionDoesNotBelongToExamException } from '../../../../utils/error/error-factory'
import { changeSectionStatus } from '../student-exam-section-service'

const findSection = student => async id => (
  findOneOrFail({ id }, ['exam'])
)

const validateExamBelongsToStudent = student => R.pipe(
  R.path(['exam', 'student_id']),
  R.unless(
    R.equals(student.id),
    () => throwException(sectionDoesNotBelongToExamException())
  )
)

export default async (student, id, payload) => {
  const section = await findSection(student)(id)

  validateExamBelongsToStudent(student)(section)

  return changeSectionStatus(id, payload.status)
}
