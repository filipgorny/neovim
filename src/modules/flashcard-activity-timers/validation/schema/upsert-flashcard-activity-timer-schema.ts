import Joi from 'joi'

export const schema = Joi.object({
  seconds: Joi.number().positive().required(),
})
