import Joi from 'joi'

export const schema = Joi.object({
  fake_rating: Joi.number().min(1).max(5).required(),
})
