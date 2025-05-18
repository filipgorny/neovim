import Joi from 'joi'

export const schema = Joi.object({
  start_number: Joi.number().required(),
})
