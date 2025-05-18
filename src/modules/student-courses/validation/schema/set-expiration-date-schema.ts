import Joi from 'joi'

export const schema = Joi.object({
  accessible_to: Joi.date().iso().required(),
})
