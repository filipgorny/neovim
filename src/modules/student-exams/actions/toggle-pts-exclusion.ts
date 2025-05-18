import R from 'ramda'
import { findOneOrFail, findAllCompletedExams } from '../student-exam-repository'
import { setPTSExclusion } from '../student-exam-service'
import { calculatePTS } from '../../../../services/student-exams/calculate-projected-target-score'
import { calculatePTS as calculateInitialPTS } from '../../../../src/modules/student-exams/student-exam-service'
import { setPTSBySections } from '../../student-exam-scores/student-exam-scores-service'
import { generateScoreProjectionData } from '../../../../services/student-exams/calculate-score-projection-data'
import { getMinScoresFromType } from '../../../../services/student-exam-scores/get-min-max-sxores'

const findExam = student => async id => (
  findOneOrFail({
    student_id: student.id,
    id,
  }, ['type.scaledScoreDefinitions.template.scores'])
)

const checkIfValidForPtsCalculation = R.pipe(
  R.reject(R.prop('is_excluded_from_pts')),
  R.isEmpty,
  R.not
)

const choosePtsArray = (defaultArray, array) => R.when(
  R.isEmpty,
  R.always(defaultArray)
)(array)

const claculateStudentPTS = async (type, student) => {
  const completedExams = await findAllCompletedExams(type.id)(student)
  const isValidForPtscalculation = checkIfValidForPtsCalculation(completedExams)
  const defaultPtsArray = getMinScoresFromType(type)

  return isValidForPtscalculation
    ? calculatePTS(completedExams)
    : choosePtsArray(
      defaultPtsArray,
      await calculateInitialPTS(1, type.id)
    )
}

export default async (student, id) => {
  const exam = await findExam(student)(id)

  await setPTSExclusion(id, !exam.is_excluded_from_pts)

  const PTS = await claculateStudentPTS(exam.type, student)

  await setPTSBySections(exam.exam_type_id, student.id)(PTS)

  return generateScoreProjectionData(student, exam.exam_type_id)
}
