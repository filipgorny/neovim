import Joi from 'joi'

export const schema = Joi.object({
  snooze_until: Joi.string().optional(),
})
