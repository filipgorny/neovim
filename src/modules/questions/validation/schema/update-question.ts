import Joi from 'joi'
import { QuestionType } from '../../question-types'

export const schema = Joi.object({
  question_content_raw: Joi.string().optional(),
  question_content_delta_object: Joi.object().optional(),
  explanation_raw: Joi.string().optional(),
  explanation_delta_object: Joi.object().optional(),
  answer_definition: Joi.object().optional(),
  type: Joi.string().valid(...Object.values(QuestionType)).optional(),
  correct_answers: Joi.array().items(
    Joi.string().min(1).max(2).required()
  ).optional(),
})
