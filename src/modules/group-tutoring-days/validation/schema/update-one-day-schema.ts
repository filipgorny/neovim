import Joi from 'joi'

export const schema = Joi.object({
  class_time: Joi.string().required(),
  class_time_end: Joi.string().required(),
  course_id: Joi.string().uuid().required(),
  class_date: Joi.date().required(),
  class_topic: Joi.string().allow(null, '').optional(),
  class_topic_number: Joi.string().allow(null, '').optional(),
  meeting_url: Joi.string().allow(null, '').optional(),
  course_tutor_id: Joi.string().uuid().allow(null, '').optional(),
})
