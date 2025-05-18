import Joi from 'joi'

export const schema = Joi.object({
  start_date: Joi.string().required(),
})
