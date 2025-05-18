import Joi from 'joi'

export const schema = Joi.object({
  phone_number: Joi.string().required(),
  email: Joi.string().required(),
})
