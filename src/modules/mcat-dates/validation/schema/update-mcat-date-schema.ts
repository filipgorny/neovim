import Joi from 'joi'

export const schema = Joi.object({
  mcat_date: Joi.date().required(),
  course_id: Joi.string().uuid().required(),
})
