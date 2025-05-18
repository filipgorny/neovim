import Joi from 'joi'

export const schema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
})
