import * as R from 'ramda'
import { flattenQuestions } from './flatten-questions'
import env from '../../utils/env'

/**
 * This service is responsible for deciding whether a student's exam or exam section should be included in the stats (e.g. question difficulty).
 *
 * Rules:
 * - Stats are only recorded for the first time a student takes the exam. Retakes are not included in stats.
 * - Stats are only recorded if a student answers more than 75% of the questions
 * - Stats are only recorded for students answering at least 10% of questions correctly.
 * - Stats are only recorded if a student takes at least 75% of the time allotted for each section.
 */

const MIN_QUESTIONS_ANSWERED = 0.75
const MIN_TIME_TAKEN = 0.4
const MIN_CORRECT_ANSWERS = 0.1

const areAllValuesTrue = R.pipe(
  R.values,
  R.all(R.equals(true))
)

const isFirstCompletion = (exam) => {
  const result = {
    is_first_completion: exam.completions_done === 0,
  }

  if (env('APP_ENV') !== 'production') {
    console.log(result)
  }

  return result
}

const isMoreThanNPercentOfQuestionsAnswered = (exam) => {
  const sections = flattenQuestions(exam)

  // Calculate percentage for each section
  const sectionPercentages = sections.map(section => {
    const sectionQuestions = section.questions
    const answeredQuestions = sectionQuestions.filter(q => q.answer !== null).length
    return answeredQuestions / sectionQuestions.length
  })

  // Calculate percentage for all questions combined
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
  const totalAnswered = sections.reduce((sum, section) =>
    sum + section.questions.filter(q => q.answer !== null).length, 0)
  const totalPercentage = totalAnswered / totalQuestions

  const result = {
    is_enough_questions_answered: totalPercentage >= MIN_QUESTIONS_ANSWERED,
    section_percentages: sectionPercentages,
    total_percentage: totalPercentage,
  }

  if (env('APP_ENV') !== 'production') {
    console.log(result)
  }

  return {
    is_enough_questions_answered: result.is_enough_questions_answered,
  }
}

const isMoreThanNPercentOfQuestionsAnsweredCorrectly = (exam) => {
  const sections = flattenQuestions(exam, true)

  // Calculate percentage for all questions combined
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)

  const totalCorrect = sections.reduce((sum, section) =>
    sum + section.questions.filter(q => q.answer === q.correct_answer).length, 0)
  const totalCorrectPercentage = totalCorrect / totalQuestions

  const result = {
    is_enough_questions_answered_correctly: totalCorrectPercentage >= MIN_CORRECT_ANSWERS,
    total_percentage: totalCorrectPercentage,
  }

  if (env('APP_ENV') !== 'production') {
    console.log(result)
  }

  return {
    is_enough_questions_answered_correctly: result.is_enough_questions_answered_correctly,
  }
}

const isEnoughTimeSpentInSections = (exam) => {
  const sectionsCombined = combineExamSections(exam)

  const allTimeSpent = R.map(calculateTimeSpentInSection(exam))(sectionsCombined)

  const result = R.all(R.lt(MIN_TIME_TAKEN))(allTimeSpent)

  if (env('APP_ENV') !== 'production') {
    console.log({ allTimeSpent })
    console.log(result)
  }

  return {
    is_enough_time_spent_in_sections: result,
  }
}

const combineExamSections = exam => {
  // First sort the sections by order
  const sortedSections = [...exam.sections].sort((a, b) => a.order - b.order)

  // Combine the sorted sections with exam_length sections
  const result = sortedSections.map((section, index) => ({
    ...section,
    ...exam.exam_length.sections[index],
  }))

  return R.map(
    R.pick(['id', 'sectionMinutes'])
  )(result)
}

const calculateTimeSpentInSection = exam => section => {
  const sectionSeconds = section.sectionMinutes * 60
  const sectionWithSecondsLeft = R.find(R.propEq('section_id', section.id))(exam.exam_seconds_left)

  return (sectionSeconds - sectionWithSecondsLeft.seconds_left) / sectionSeconds
}

export const shouldIncludeStudentExamInStats = (exam, booleanAnswer = true) => {
  const result = {
    // is_debug: true,
    ...isFirstCompletion(exam),
    ...isMoreThanNPercentOfQuestionsAnswered(exam),
    ...isMoreThanNPercentOfQuestionsAnsweredCorrectly(exam),
    // ...isEnoughTimeSpentInSections(exam),
  }

  if (env('APP_ENV') !== 'production') {
    console.log('shouldIncludeStudentExamInStats', result)
  }

  return booleanAnswer ? areAllValuesTrue(result) : result
}
