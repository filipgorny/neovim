import Joi from 'joi'

export const schema = Joi.object({
  is_correct: Joi.boolean().required(),
})
