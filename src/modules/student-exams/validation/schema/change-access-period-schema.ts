import Joi from 'joi'

export const schema = Joi.object({
  expiration_date: Joi.date().iso().required(),
})
