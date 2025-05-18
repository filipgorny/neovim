import Joi from 'joi'

export const schema = Joi.object({
  order: Joi.number().required(),
})
