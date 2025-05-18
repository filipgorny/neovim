import Joi from 'joi'

export const schema = Joi.object({
  days: Joi.array().items(
    Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun').required()
  ).required(),
  time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
})
