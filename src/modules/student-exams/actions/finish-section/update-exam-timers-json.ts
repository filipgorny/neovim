import * as R from 'ramda'
import { findOneOrFail as findSection } from '../../../student-exam-sections/student-exam-section-repository'
import { updateTimers } from '../../../student-exams/student-exam-service'

type TimerRecord = {
  checking: number,
  reading: number,
  working: number,
  resource_type: string,
  original_resource_id: string,
}

const wrapTimers = R.pick(['checking', 'working', 'reading'])

const transformResources = resourceType => R.map(
  R.pipe(
    R.juxt([
      R.pipe(
        R.prop(`original_exam_${resourceType}_id`),
        R.objOf('original_resource_id')
      ),
      wrapTimers,
      R.pipe(
        R.always(resourceType),
        R.objOf('resource_type')
      ),
    ]),
    // @ts-ignore
    R.mergeAll
  )
)

const transformPassages = transformResources('passage')
const transformQuestions = transformResources('question')

const extractQuestions = R.pipe(
  R.map(
    R.prop('questions')
  ),
  R.flatten
)

const buildUpdatedTimers = timers => timersSource => {
  R.map(
    (record: TimerRecord) => {
      timers[record.original_resource_id] = timers[record.original_resource_id] ? timers[record.original_resource_id] : {}
      timers[record.original_resource_id].checking = record.checking
      timers[record.original_resource_id].reading = record.reading
      timers[record.original_resource_id].working = record.working
      timers[record.original_resource_id].resource_type = record.resource_type

      return timers
    }
  )(timersSource)

  return timers
}

export const updateExamTimersJson = async (sectionId: string) => {
  const section = await findSection({
    id: sectionId,
  }, ['passages.questions', 'exam'])

  const passages = R.prop('passages')(section)
  // @ts-ignore
  const transformedPassages = transformPassages(passages)

  // @ts-ignore
  const questions = extractQuestions(passages)
  const transformedQuestions = transformQuestions(questions)

  const timersSource = R.concat(transformedPassages, transformedQuestions)

  const timers = R.pipe(
    R.path(['exam', 'timers']),
    JSON.parse
  )(section)

  // @ts-ignore
  const timersUpdated = buildUpdatedTimers(timers)(timersSource)
  const examId = R.path(['exam', 'id'])(section)

  // @ts-ignore
  return updateTimers(examId, JSON.stringify(timersUpdated))
}
