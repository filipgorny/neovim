import Joi from 'joi'

export const schema = Joi.object({
  namespace: Joi.string().required(),
  name: Joi.string().required(),
  value: Joi.any().required(),
})
