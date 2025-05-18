import R from 'ramda'
import { generateScoreProjectionData } from '../../../../services/student-exams/calculate-score-projection-data'
import { fetchRandomStudentExam } from '../student-exam-repository'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOne as findExamType } from '../../exam-types/exam-type-repository'

const validateIfUserOwnExamType = async (studentId: string, examTypeId: string) => R.pipeWith(R.andThen)([
  async () => fetchRandomStudentExam(studentId, examTypeId),
  R.when(
    R.isNil,
    () => throwException(customException('exam-type-id.mismatch', 422, 'Exam type does not belong to student'))
  ),
])(true)

const validateIfScoresAvailable = async id => R.pipeWith(R.andThen)([
  async () => findExamType({ id }),
  R.propOr(false, 'score_calculations_enabled'),
  R.when(
    R.not,
    () => throwException(customException('exam-scores.unavaiable', 409, 'Student exam scores are still pending'))
  ),
])(true)

export default async (student, examTypeId) => {
  await validateIfUserOwnExamType(student.id, examTypeId)
  await validateIfScoresAvailable(examTypeId)

  return generateScoreProjectionData(student, examTypeId)
}
