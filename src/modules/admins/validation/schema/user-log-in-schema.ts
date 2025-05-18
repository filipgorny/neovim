import Joi from 'joi'

export const schema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
})
