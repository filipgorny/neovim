import * as R from 'ramda'
import mapP from '../../utils/function/mapp'
import { findOneOrFail, patch } from '../../src/modules/exam-passages/exam-passage-repository'
import { updateSingleEntity } from './timer-utils'

const findPassage = async (id: string) => findOneOrFail({ id })
const updatePassageTimers = (id: string) => async payload => patch(id, payload)

export const calculateAvgPassageTimers = async (timers: {}) => (
  R.pipe(
    R.keys,
    mapP(
      updateSingleEntity(findPassage, updatePassageTimers, timers)
    )
  )(timers)
)
