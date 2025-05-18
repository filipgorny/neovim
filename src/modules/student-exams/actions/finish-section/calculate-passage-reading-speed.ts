import * as R from 'ramda'
import { calculateReadingSpeed } from '../../../../../services/student-exam-passages/calculate-reading-speed'
import mapP from '../../../../../utils/function/mapp'
import { patch } from '../../../student-exam-passages/student-exam-passage-repository'

const saveReadingSpeed = async passage => (
  // @ts-ignore
  patch(passage.id, calculateReadingSpeed(passage))
)

export const calculatePassageReadingSpeed = async section => (
  R.pipe(
    R.prop('passages'),
    mapP(saveReadingSpeed)
  )(section)
)
