import * as R from 'ramda'
import { findOne as findExam } from '../../src/modules/student-exams/student-exam-repository'
import { flattenQuestionsCustom } from '../student-exams/flatten-questions'
import { extractQuestionTimers, extractPassageTimers, parseExamTimers, buildTimerPayload } from '../timers/timer-utils'
import { calculateAvgQuestionTimers } from '../timers/calculate-avg-question-timers'
import { calculateAvgPassageTimers } from '../timers/calculate-avg-passage-timers'
import { calculateAvgTargetQuestionTimers } from '../timers/calculate-avg-target-question-timers'
import { calculateAvgTargetPassageTimers } from '../timers/calculate-avg-target-passage-timers'
import { shouldIncludeStudentExamInStats } from '../student-exams/inclusion-in-stats'

const validateExamIsIntact = R.propEq('is_intact', true)

// Jon changed his mind about only penultimate exmas, for now all intact exams should be included in calculations
// in order to bring back the penultimate validation uncomment lines in the following function
const shouldIncludeInCalculations = async exam => {
  // const penultimateExam = await getSetting('examAmountThreshold')

  if (!shouldIncludeStudentExamInStats(exam)) {
    return false
  }

  return R.allPass([
    // validateIsPenultimateExam(penultimateExam),
    validateExamIsIntact,
  ])(exam)
}

export const calculateAverageTimePerQuestionWithTargetScore = async (exam, student) => {
  const fullExam = await findExam({
    id: exam.id,
  }, ['originalExam', 'sections.passages.questions.originalQuestion'])

  if (!await shouldIncludeInCalculations(exam)) {
    return
  }

  const flatSections = flattenQuestionsCustom(fullExam, {
    withOriginalQuestions: true,
  })

  const timers = parseExamTimers(fullExam)
  const questionTimers = extractQuestionTimers(timers)
  const passageTimers = extractPassageTimers(timers)

  await Promise.all([
    calculateAvgQuestionTimers(questionTimers),
    calculateAvgPassageTimers(passageTimers),
    calculateAvgTargetQuestionTimers(fullExam, questionTimers, flatSections),
    calculateAvgTargetPassageTimers(fullExam, passageTimers, flatSections),
  ])

  return true
}
