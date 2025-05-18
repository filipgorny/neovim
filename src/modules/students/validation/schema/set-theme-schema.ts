import Joi from 'joi'

export const schema = Joi.object({
  theme: Joi.boolean().valid('dark', 'light').required(),
})
