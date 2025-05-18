import Joi from 'joi'

export const schema = Joi.object({
  exam_at: Joi.any().optional(),
  calendar_start_at: Joi.any().optional(),
  mcat_date_id: Joi.string().uuid().optional(),
  pre_reading_end_date: Joi.any().optional(),
  build_calendar: Joi.number().optional(),
  is_pre_reading: Joi.boolean().optional(),
})
