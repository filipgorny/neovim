import Joi from 'joi'

export const schema = Joi.object({
  days_off: Joi.array().items(
    Joi.date()
  ).required(),
})
