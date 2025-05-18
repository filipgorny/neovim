import Joi from 'joi'

export const schema = Joi.object({
  exam_at: Joi.date().iso(),
  mcat_date_id: Joi.string().uuid().optional(),
  build_calendar: Joi.number().optional(),
  study_days: Joi.number().optional(),
  date_end: Joi.date().iso().optional(),
  is_pre_reading: Joi.boolean().optional(),
})
