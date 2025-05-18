import Joi from 'joi'
import { ContentQuestionReactionTypeEnum } from '../../content-question-reaction-types'

export const schema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(ContentQuestionReactionTypeEnum.correct, ContentQuestionReactionTypeEnum.incorrect),
})

export const fileSchema = Joi.object({
  animation: Joi.required(),
  sound: Joi.required(),
})
