import Joi from 'joi'

export const schema = Joi.object({
  student_email: Joi.string().required(),
  student_name: Joi.string().required(),
  student_phone: Joi.string().required(),
  external_id: Joi.number().allow(null, '').optional(),
  username: Joi.string().allow(null, '').optional(),
})
