import Joi from 'joi'

export const schema = Joi.object({
  course_id: Joi.string().uuid().required(),
  start_date: Joi.string().required(),
  end_date: Joi.string().required(),
  calendar_image_url: Joi.string().optional(),
  meeting_url: Joi.string().optional(),
  semester_name: Joi.string().optional(),
})
