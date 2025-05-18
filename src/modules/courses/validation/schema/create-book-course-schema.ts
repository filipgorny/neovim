import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().required(),
  external_id: Joi.string().required(),
  codename: Joi.string().allow('').length(3).optional(),
  max_exam_completions: Joi.number().integer().min(1).max(999).required(),
})
