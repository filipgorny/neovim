import Joi from 'joi'

export const schema = Joi.object({
  value: Joi.number().required(),
})
