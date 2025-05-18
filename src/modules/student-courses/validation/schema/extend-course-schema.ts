import Joi from 'joi'

export const schema = Joi.object({
  course_id: Joi.string().uuid().required(),
  student_id: Joi.string().uuid().required(),
  days_amount: Joi.number().integer().min(1).required(),
})
