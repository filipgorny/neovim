import * as R from 'ramda'
import mapP from '../../utils/function/mapp'
import { findOneOrFail, patch } from '../../src/modules/exam-questions/exam-question-repository'
import { updateSingleEntity } from './timer-utils'

const findQuestion = async (id: string) => findOneOrFail({ id })
const updateQuestionTimers = (id: string) => async payload => patch(id, payload)

export const calculateAvgQuestionTimers = async (timers: {}) => (
  R.pipe(
    R.keys,
    mapP(
      updateSingleEntity(findQuestion, updateQuestionTimers, timers)
    )
  )(timers)
)
