import Joi from 'joi'

export const schema = Joi.object({
  question: Joi.string(),
  raw_question: Joi.string(),
  explanation: Joi.string(),
  raw_explanation: Joi.string(),
  question_html: Joi.string().allow(''),
  explanation_html: Joi.string().allow(''),
})

export const fileSchema = Joi.object({
  questionImage: Joi.any(),
  explanationImage: Joi.any(),
})
