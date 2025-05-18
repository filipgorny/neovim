import Joi from 'joi'

export const schema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().optional().allow(''),
  is_active: Joi.boolean().optional(),
  image: Joi.any().optional().allow(null),
})
