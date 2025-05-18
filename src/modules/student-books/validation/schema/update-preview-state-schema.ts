import Joi from 'joi'

export const schema = Joi.object({
  preview_state: Joi.string().allow(null, '').required(),
})
