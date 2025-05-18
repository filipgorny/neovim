import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().optional(),
}).optional()
