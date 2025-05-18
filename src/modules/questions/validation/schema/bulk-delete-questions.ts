import Joi from 'joi'
import { QuestionType } from '../../question-types'

export const schema = Joi.object({
  ids: Joi.array().items(
    Joi.string().uuid().required()
  ).required(),
})
