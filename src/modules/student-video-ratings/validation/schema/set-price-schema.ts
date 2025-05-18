import Joi from 'joi'

export const schema = Joi.object({
  price: Joi.number().required(),
})
