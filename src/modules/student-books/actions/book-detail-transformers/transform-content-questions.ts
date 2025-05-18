import * as R from 'ramda'
import { calculateSaltyBucksForCorrectContentQuestionAnswer } from '../../../../../services/salty-bucks/salty-buck-service'

export const transformContentQuestions = (baseValueSetting, multiplierSetting) => R.when(
  R.has('original_content_questions'),
  R.over(
    R.lensProp('original_content_questions'),
    R.map(
      question => (
        R.pipe(
          R.evolve({
            answer_definition: JSON.parse,
            correct_answers: JSON.parse,
            question: JSON.parse,
            explanation: JSON.parse,
          }),
          R.set(
            R.lensProp('salty_bucks_value'),
            calculateSaltyBucksForCorrectContentQuestionAnswer(
              multiplierSetting.value,
              question.difficulty_percentage,
              baseValueSetting.value
            )
          )
        )(question)
      )
    )
  )
)
