import Joi from 'joi'

export const schema = Joi.object({
  code: Joi.number().required(),
})
