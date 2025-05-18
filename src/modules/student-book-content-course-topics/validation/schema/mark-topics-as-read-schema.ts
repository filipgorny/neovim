import Joi from 'joi'

export const schema = Joi.object({
  is_read: Joi.boolean().required(),
})
