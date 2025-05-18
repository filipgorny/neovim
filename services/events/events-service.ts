import EventEmitter from 'events'
import { calculateAverageTimePerQuestionWithTargetScore } from '../exam-diagnostics/calculate-target-score-average-time-per-question'
import { calculateAverageTimePerPassageWithTargetScore } from '../exam-diagnostics/calculate-target-score-average-time-per-passage'
import { EXAM_FINISHED } from './event-names'

const eventHandler = new EventEmitter()

export const getEventService = () => eventHandler

const handleExamFinish = (exam, student) => async () => {
  await calculateAverageTimePerQuestionWithTargetScore(exam, student)
  await calculateAverageTimePerPassageWithTargetScore(exam, student)
}

export const registerEventHandlers = () => {
  const eventHandler = getEventService()

  eventHandler.on(EXAM_FINISHED, (exam, student) => {
    setImmediate(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      handleExamFinish(exam, student)
    )
  })
}
