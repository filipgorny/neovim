import Joi from 'joi'

export const schema = Joi.object({
  course_id: Joi.string().uuid().required(),
  name: Joi.string().required(),
  bio: Joi.string().optional().allow(''),
  is_active: Joi.boolean().optional(),
})
