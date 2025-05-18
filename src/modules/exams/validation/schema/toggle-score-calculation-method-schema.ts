import Joi from 'joi'
import { ScoreCalculationMethod } from '../../score-calculation-methods'

export const schema = Joi.object({
  method: Joi.string().valid(
    ScoreCalculationMethod.manufactured,
    ScoreCalculationMethod.normal,
    ScoreCalculationMethod.scaled,
    ScoreCalculationMethod.percentile
  ).required(),
})
