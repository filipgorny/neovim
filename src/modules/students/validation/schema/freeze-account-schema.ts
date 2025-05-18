import Joi from 'joi'

export const schema = Joi.object({
  freeze_reason: Joi.string().allow('').optional(),
})
