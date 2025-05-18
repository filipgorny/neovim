import * as R from 'ramda'
import { stitchArraysByProp } from '../../utils/array/stitch-arrays-by-prop'
import mapP from '../../utils/function/mapp'
import { embedKeyAsProp } from '../../utils/object/embed-key-as-prop'
import { patch as patchStudentExamQuestion } from '../../src/modules/student-exam-questions/student-exam-question-repository'
import { patch as patchStudentExamPassage } from '../../src/modules/student-exam-passages/student-exam-passage-repository'

const updateStudentTimers = async (patchFn, partial) => {
  const { reading, working, checking, id } = partial

  if (!working) {
    return
  }

  return patchFn(id, {
    reading, working, checking,
  })
}

const updateStudentExamQuestion = async (questionPartial) => (
  updateStudentTimers(patchStudentExamQuestion, questionPartial)
)

const updateStudentExamPassage = async (passagePartial) => (
  updateStudentTimers(patchStudentExamPassage, passagePartial)
)

const calculateStudentResourceTimers = async (resourceType, mapFn, records, timers) => {
  const timerPayload = R.pipe(
    embedKeyAsProp(`original_exam_${resourceType}_id`),
    stitchArraysByProp(`original_exam_${resourceType}_id`, records),
    // @ts-ignore
    R.map(
      R.pick(['id', 'reading', 'working', 'checking'])
    )
    // @ts-ignore
  )(timers)

  await mapP(mapFn)(timerPayload)
}

export const calculateStudentQuestionTimers = async (questions, questionTimers) => (
  calculateStudentResourceTimers('question', updateStudentExamQuestion, questions, questionTimers)
)

export const calculateStudentPassageTimers = async (passages, passageTimers) => (
  calculateStudentResourceTimers('passage', updateStudentExamPassage, passages, passageTimers)
)
