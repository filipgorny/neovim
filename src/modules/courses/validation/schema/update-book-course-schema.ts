import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().optional(),
  external_id: Joi.string().optional(),
  course_topics_title: Joi.string().allow('').optional(),
  exam_retakes_enabled: Joi.boolean(),
  codename: Joi.string().allow('').length(3).optional(),
  max_exam_completions: Joi.number().integer().min(1).max(999).required(),
  logo_url: Joi.any().optional().allow(''),
})
