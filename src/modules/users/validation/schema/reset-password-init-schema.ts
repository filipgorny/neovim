import Joi from 'joi'

export const schema = Joi.object({
  email: Joi.string().required(),
  link: Joi.string().required(),
  token: Joi.string().required(),
})
