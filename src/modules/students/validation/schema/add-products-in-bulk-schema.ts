import Joi from 'joi'

export const schema = Joi.object({
  course_ids: Joi.array().items(Joi.string().required()),
  exam_ids: Joi.array().items(Joi.string().required()),
  student_ids: Joi.array().items(Joi.string().uuid().required()).required(),
})
