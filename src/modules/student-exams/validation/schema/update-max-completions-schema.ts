import Joi from 'joi'

export const schema = Joi.object({
  max_completions: Joi.number().positive().max(999).required(),
})
