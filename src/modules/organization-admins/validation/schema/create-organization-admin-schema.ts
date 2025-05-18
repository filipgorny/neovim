import Joi from 'joi'

export const schema = Joi.object({
  email: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
})
