import Joi from 'joi'

export const schema = Joi.object({
  day_off_date: Joi.date().required(),
})
