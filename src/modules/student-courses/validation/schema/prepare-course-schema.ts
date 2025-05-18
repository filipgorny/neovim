import Joi from 'joi'

export const schema = Joi.object({
  expected_end_date: Joi.date().iso().allow(null),
})
