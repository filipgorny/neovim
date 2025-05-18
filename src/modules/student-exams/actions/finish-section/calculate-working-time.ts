import * as R from 'ramda'
import { patch as patchQuestion } from '../../../student-exam-questions/student-exam-question-repository'
import mapP from '../../../../../utils/function/mapp'
import { average } from '../../../../../utils/array/average'
import { determineQWT } from './determine-qwt'
import { findOneOrFail } from '../../../student-exam-sections/student-exam-section-repository'
import { patch as patchPassage } from '../../../student-exam-passages/student-exam-passage-repository'
import asAsync from '../../../../../utils/function/as-async'
import { tweakPassageTimers } from './tweak-passage-timers'

/**
 * Dear Developer,
 *
 * I'm very sorry for the state of this code. The logic of the timers was changed multiple times and deadlines were pressing.
 * Should you have to work on this file - may god have mercy on your soul and forgive me for creating this abomination.
 *
 * Sincerely,
 * Fen
 */

const extractQuestionTimers = R.pipe(
  JSON.parse,
  R.filter(
    R.propEq('resource_type', 'question')
  )
)

const extractPassages = R.pipe(
  R.prop('passages'),
  // @ts-ignore
  R.sortBy(
    R.prop('order')
  )
)

const getFirstQuestionsFromPassages = R.pipe(
  extractPassages,
  R.pluck('questions'),
  R.map(
    R.find(
      R.propEq('order', 1)
    )
  ),
  R.reject(R.isNil),
  R.map(
    R.pick(['id', 'original_exam_question_id', 'passage', 'working'])
  )
)

const calculateAvgWorkingForAllPassages = R.pipe(
  R.pluck('questions'),
  R.flatten,
  // @ts-ignore
  R.pluck('working'),
  // @ts-ignore
  R.filter(R.identity),
  average,
  Math.round
)

const mergeQuestionsWithAverageWorkingTime = avgWorkingTime => questions => (
  R.map(
    R.mergeLeft({
      workingTime: avgWorkingTime,
    })
  )(questions)
)

const mergeQuestionsWithWorkingTempTime = timers => questions => (
  R.map(
    question => {
      return R.mergeLeft({
        // @ts-ignore
        workingTimeTemp: R.pathOr(0, [question.original_exam_question_id, 'working_temp'])(timers),
        // @ts-ignore
      })(question)
    }
  )(questions)
)

const embedSinglePRT = question => (
  R.mergeLeft({
    passageReading: R.path(['passage', 'reading'])(question),
  })(question)
)

const embedPassageReadingTime = questions => (
  R.map(embedSinglePRT)(questions)
)

const updateFirstQuestions = async (questions, avg) => (
  mapP(
    async question => (
      patchQuestion(question.id, {
        working: determineQWT(question, avg)(),
      })
    )
    // @ts-ignore
  )(questions)
)

const filterQuestionsWithNullOrZeroWorkingTime = R.filter(
  R.anyPass([
    R.propSatisfies(R.isNil, 'working'),
    R.propEq('working', 0),
  ])
)

const filterPassagesForReadingTimeTweak = allowedIds => passages => (
  R.filter(
    R.propSatisfies(
      id => R.includes(id, allowedIds),
      'id'
    )
  )(passages)
)

const tweakPassageReadingTime = async passage => {
  const firstQuestionWorkingTime = R.pipe(
    R.prop('questions'),
    R.find(
      R.propEq('order', 1)
    ),
    // @ts-ignore
    R.prop('working')
    // @ts-ignore
  )(passage)

  return patchPassage(passage.id, {
    // @ts-ignore
    reading: R.max(passage.reading - firstQuestionWorkingTime, 0),
  })
}

const reduceHighestQuestionWorkingTime = async (timeDiff, questions) => {
  const questionWithHighestWorkingTime = R.pipe(
    R.sortWith([
      R.descend(R.prop('working')),
    ]),
    R.head
  )(questions)

  // @ts-ignore
  return patchQuestion(questionWithHighestWorkingTime.id, {
    // @ts-ignore
    working: R.max(questionWithHighestWorkingTime.working - timeDiff, 0),
  })
}

const tweakSummaryExamLength = async section => {
  const sectionLengthInSeconds = R.pipe(
    R.path(['exam', 'exam_length']),
    R.prop('sections'),
    R.nth(section.order - 1),
    R.prop('sectionMinutes'),
    R.multiply(60)
  )(section)

  const questions = R.pipe(
    R.prop('passages'),
    // @ts-ignore
    R.pluck('questions'),
    R.flatten
    // @ts-ignore
  )(section)

  const examLengthFromQuestions = R.pipe(
    R.pluck('working'),
    R.sum
    // @ts-ignore
  )(questions)

  if (examLengthFromQuestions > sectionLengthInSeconds) {
    return reduceHighestQuestionWorkingTime(examLengthFromQuestions - sectionLengthInSeconds, questions)
  }
}

export const calculateWorkingTime = async section => {
  // @ts-ignore
  const passages = extractPassages(section)

  const timers = R.pipe(
    R.path(['exam', 'timers']),
    extractQuestionTimers
  )(section)

  // @ts-ignore
  const firstQuestionAvgWorkingTime = calculateAvgWorkingForAllPassages(passages)

  const questionsRefined = R.pipe(
    getFirstQuestionsFromPassages,
    // @ts-ignore
    filterQuestionsWithNullOrZeroWorkingTime,
    mergeQuestionsWithAverageWorkingTime(firstQuestionAvgWorkingTime),
    mergeQuestionsWithWorkingTempTime(timers),
    embedPassageReadingTime
    // @ts-ignore
  )(section)

  const passageIdsForReadingTimeTweak = R.pipe(
    R.pluck('passage'),
    // @ts-ignore
    R.pluck('id')
    // @ts-ignore
  )(questionsRefined)

  await updateFirstQuestions(questionsRefined, firstQuestionAvgWorkingTime)

  const updatedSection = await findOneOrFail({
    id: section.id,
  }, ['passages.questions'])

  await R.pipeWith(R.andThen)([
    asAsync(extractPassages),
    filterPassagesForReadingTimeTweak(passageIdsForReadingTimeTweak),
    R.map(tweakPassageReadingTime),
  ])(updatedSection)

  await tweakSummaryExamLength(section)

  return tweakPassageTimers(section.id)
}
