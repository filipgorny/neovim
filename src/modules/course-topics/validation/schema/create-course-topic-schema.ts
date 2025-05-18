import Joi from 'joi'

export const schema = Joi.object({
  topic: Joi.string().required(),
  level: Joi.number().integer().greater(-1).required(),
})
