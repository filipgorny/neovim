import Joi from 'joi'

export const schema = Joi.object({
  access_period: Joi.number().positive().required(),
})
