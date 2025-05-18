import Joi from 'joi'

export const schema = Joi.object({
  external_student_id: Joi.number().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  name: Joi.string().required(),
})
