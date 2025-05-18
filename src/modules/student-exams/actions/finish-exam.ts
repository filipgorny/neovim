import R from 'ramda'
import { findOneOrFail, findAllCompletedExams } from '../student-exam-repository'
import { finishExam, resetCurrentPage } from '../student-exam-service'
import { calculateScores } from '../../../../services/student-exams/calculate-scores'
import { calculatePTS } from '../../../../services/student-exams/calculate-projected-target-score'
import { getEventService } from '../../../../services/events/events-service'
import { EXAM_FINISHED } from '../../../../services/events/event-names'
import { setPTSBySections } from '../../student-exam-scores/student-exam-scores-service'
import { STUDENT_EXAM_SCORE_STATUS_CALCULATED, STUDENT_EXAM_SCORE_STATUS_PENDING } from '../student-exam-score-statuses'
import { earnSaltyBucksForFinishingExam } from '../../../../services/salty-bucks/salty-buck-service'
import { ScoreCalculationMethod } from '../../exams/score-calculation-methods'
import { flattenQuestions } from '../../../../services/student-exams/flatten-questions'
import { updateExamScoreMap } from '../../exam-score-map/exam-score-map-service'
import { markEventAsCompletedByStudentItemId } from '../../student-calendar-events/student-calendar-events-service'
import { StudentCourse } from '../../../types/student-course'
import { createStudentExamCompletion } from '../../student-exam-completions/student-exam-completions-service'
import { shouldIncludeStudentExamInStats } from '../../../../services/student-exams/inclusion-in-stats'

const findExam = student => async id => (
  findOneOrFail({
    student_id: student.id,
    id,
  }, ['sections.passages.questions', 'sections', 'type', 'originalExam.scores', 'originalExam.sections.scores'])
)

const shouldCalculateManufacturedScores = R.pathSatisfies(
  R.equals(ScoreCalculationMethod.manufactured),
  ['originalExam', 'score_calculation_method']
)

const determineScoreStatus = (exam, scoreCalculationsEnabled) => {
  if (shouldCalculateManufacturedScores(exam)) {
    return STUDENT_EXAM_SCORE_STATUS_CALCULATED
  }

  return scoreCalculationsEnabled ? STUDENT_EXAM_SCORE_STATUS_CALCULATED : STUDENT_EXAM_SCORE_STATUS_PENDING
}

const finishStudentExamAndSetScores = async (student, exam) => {
  const scoreCalculationsEnabled = R.pathOr(false, ['type', 'score_calculations_enabled'])(exam)
  const scores = await calculateScores(exam, scoreCalculationsEnabled)
  const scoreStatus = determineScoreStatus(exam, scoreCalculationsEnabled)
  const finishedExam = await finishExam(exam.id, student.id, exam.exam_type_id, scores, scoreStatus, exam.completions_done)

  if (exam.completions_done === 0) {
    await createStudentExamCompletion(finishedExam.toJSON(), student.id)
  }

  if (scoreCalculationsEnabled) {
    const allExams = await findAllCompletedExams(exam.exam_type_id)(student)
    const PTS = await calculatePTS(allExams)

    await setPTSBySections(exam.exam_type_id, student.id)(PTS)
  }

  return finishedExam
}

export default async (student, id, studentCourse?: StudentCourse) => {
  const exam = await findExam(student)(id)

  // exam already finished - do nothing
  if (exam.completed_at) {
    return exam
  }

  await resetCurrentPage(exam.id)

  /**
   * Stats are only recorded for the first time a student takes the exam. Retakes are not included in stats.
   * Stats are only recorded if a student answers more than 75% of the questions
   * Stats are only recorded if a student takes at least 40% of the time allotted for each section.
   * Stats are only recorded for students answering at least 15% of questions correctly.
   */
  if (shouldIncludeStudentExamInStats(exam)) {
    await updateExamScoreMap(flattenQuestions(exam, true), exam.originalExam)
  }

  const hasCourses = R.pathOr(false, ['attributes', 'has_courses'], student)

  const finishedExam = await finishStudentExamAndSetScores(student, exam)

  await markEventAsCompletedByStudentItemId(exam.id)

  getEventService().emit(EXAM_FINISHED, exam, student)

  // Earn salty bucks for finishing the exam for the first time
  if (hasCourses && exam.completions_done === 0) {
    await earnSaltyBucksForFinishingExam(student.id, exam.id, exam.type.type, studentCourse)
  }

  return finishedExam
}
