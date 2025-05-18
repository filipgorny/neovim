import Joi from 'joi'

export const schema = Joi.object({
  end_date_id: Joi.string().uuid().required(),
  class_time: Joi.string().required(),
  class_time_end: Joi.string().required(),
  class_date: Joi.date().required(),
  class_topic: Joi.string().allow(null, '').optional(),
  class_topic_number: Joi.string().allow(null, '').optional(),
  meeting_url: Joi.string().allow(null, '').optional(),
  book_chapter_id: Joi.string().uuid().allow(null, '').optional(),
  exam_id: Joi.string().uuid().allow(null, '').optional(),
  custom_title: Joi.string().allow(null, '').optional(),
  fill_colour_start: Joi.string().allow(null, '').optional(),
  fill_colour_stop: Joi.string().allow(null, '').optional(),
  font_colour: Joi.string().allow(null, '').optional(),
  course_tutor_id: Joi.string().uuid().allow(null, '').optional(),
})
