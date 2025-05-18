import Joi from 'joi'
import { QuestionType } from '../../question-types'

export const schema = Joi.object({
  question_content_raw: Joi.string().required(),
  question_content_delta_object: Joi.object().required(),
  explanation_raw: Joi.string().required(),
  explanation_delta_object: Joi.object().required(),
  answer_definition: Joi.object().required(),
  type: Joi.string().valid(...Object.values(QuestionType)).required(),
  correct_answers: Joi.array().items(
    Joi.string().min(1).max(2).required()
  ).required(),
})
