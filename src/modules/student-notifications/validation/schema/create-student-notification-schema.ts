import Joi from 'joi'

export const schema = Joi.object({
  author_id: Joi.string().required(),
  notification_id: Joi.string().required(),
  student_id: Joi.string().required(),
  student_course_id: Joi.string().required(),
  created_at: Joi.string().required(),
  title: Joi.string().required(),
  description_raw: Joi.string().required(),
  description_delta_object: Joi.string().required(),
  description_html: Joi.string().required(),
})
