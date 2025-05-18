import Joi from 'joi'

export const schema = Joi.object({
  date_start: Joi.date().optional(),
  date_end: Joi.date().optional(),
  is_reset: Joi.boolean().optional(),
})
