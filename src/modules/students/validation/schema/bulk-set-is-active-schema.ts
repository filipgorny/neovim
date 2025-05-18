import Joi from 'joi'

export const schema = Joi.object({
  is_active: Joi.boolean().required(),
  ids: Joi.array().required(),
})
