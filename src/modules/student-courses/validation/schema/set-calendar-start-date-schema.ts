import Joi from 'joi'

export const schema = Joi.object({
  calendar_start_at: Joi.date().iso(),
})
