import Joi from 'joi'

export const schema = Joi.object({
  course_end_date_days_id: Joi.string().uuid().required(),
})
