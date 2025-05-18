import Joi from 'joi'

export const schema = Joi.object({
  raw: Joi.string().required(),
  delta_object: Joi.object().required(),
})
