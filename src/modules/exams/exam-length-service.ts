import R from 'ramda'
import { QuestionSet } from '../../types/exam'
import { QUESTION_TIME_SHORT, QUESTION_TIME_LONG } from './question-times'

const timeMultiplierBySectionName = sectionName => sectionName === 'CARS' ? QUESTION_TIME_LONG : QUESTION_TIME_SHORT

const processQuestionSet = (questionSet: QuestionSet) => {
  return R.pipe(
    R.prop('questions'),
    R.reject(
      R.anyPass([
        R.propSatisfies(R.isEmpty, 'explanation'),
      ])
    ),
    R.prop('length')
  )(questionSet)
}

const sectionLengthInMinutes = (timeMultiplier, questionAmount) => (
  R.pipe(
    R.multiply(timeMultiplier),
    R.divide(R.__, 60),
    Math.round
  )(questionAmount)
)

const processSection = section => {
  const sectionName = R.pipe(
    R.keys,
    R.head
  )(section)

  const questionAmount = R.pipe(
    // @ts-ignore
    R.prop(sectionName),
    R.map(processQuestionSet),
    R.sum
    // @ts-ignore
  )(section)

  const timeMultiplier = timeMultiplierBySectionName(sectionName)

  return {
    section: sectionName,
    amount: questionAmount,
    sectionMinutes: sectionLengthInMinutes(timeMultiplier, questionAmount),
    timeMultiplier,
  }
}

const sumQuestions = R.pipe(
  R.pluck('amount'),
  R.sum
)

const sumMinutes = R.pipe(
  R.pluck('sectionMinutes'),
  R.sum
)

const formatOutput = sectionCount => R.applySpec({
  summary: R.applySpec({
    sectionCount: R.always(sectionCount),
    minutes: sumMinutes,
    questions: sumQuestions,
  }),
  sections: R.identity,
})

export const calculateExamLength = (questionSets: object[]) => (
  R.pipe(
    R.map(processSection),
    formatOutput(questionSets.length)
  )(questionSets)
)

export const getExamLength = exam => (
  R.pipe(
    R.prop('exam_length'),
    JSON.parse,
    R.path(['summary', 'minutes'])
  )(exam)
)
