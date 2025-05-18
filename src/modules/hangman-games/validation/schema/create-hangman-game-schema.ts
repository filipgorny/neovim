import Joi from 'joi'

export const schema = Joi.object({
  amount_correct: Joi.number().required(),
  amount_incorrect: Joi.number().required(),
  score: Joi.number().required(),
})
