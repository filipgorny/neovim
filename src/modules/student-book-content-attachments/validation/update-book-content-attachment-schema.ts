import Joi from 'joi'

export const schema = Joi.object({
  delta_object: Joi.object().required(),
})
