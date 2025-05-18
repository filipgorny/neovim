import Joi from 'joi'

export const schema = Joi.object({
  student_email: Joi.string().email().required(),
  student_phone: Joi.string().required(),
  student_name: Joi.string().required(),
  product_ids: Joi.string().allow(''),
  product_type: Joi.string().allow(''),
  date_created: Joi.string().allow(''),
  course_ids: Joi.string().allow(''),
  course_transdate: Joi.string().allow(''),
  username: Joi.string().optional(),
  preview_admin: Joi.object({
    id: Joi.string().uuid(),
    email: Joi.string().email(),
    role: Joi.string(),
  }),
  profiling: Joi.any().optional(),
  jti: Joi.any(),
  iat: Joi.any(),
  ext: Joi.any(),
  exp: Joi.any(),
})
