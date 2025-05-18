import Joi from 'joi'

export const schema = Joi.object({
  external_student_id: Joi.number().required(),
})
