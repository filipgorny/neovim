/**
 * After finishing a section, the working time for the first question is obfuscated.
 * We want to calculate it based on te average working time for all questions from the section,
 * skipping the first question.
 */

import * as R from 'ramda'
import { average } from '../../utils/array/average'
import { stitchArraysByPropStrict } from '../../utils/array/stitch-arrays-by-prop'

const skipFirstQuestion = R.reject(
  R.propEq('order', 1)
)

export const calculateFirstQuestionWorkingTime = timers => questions => {
  return R.pipe(
    stitchArraysByPropStrict('original_exam_question_id', questions),
    skipFirstQuestion,
    // @ts-ignore
    R.pluck('working'),
    average,
    Math.round
    // @ts-ignore
  )(timers)
}
