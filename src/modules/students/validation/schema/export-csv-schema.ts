import Joi from 'joi'

export const schema = Joi.object({
  ids: Joi.array().required(),
  to_export: Joi.object({
    personal_data: Joi.boolean().required(),
    exam_data: Joi.boolean().required(),
    primary_score_data: Joi.boolean().required(),
    time_data: Joi.boolean().required(),
  }).required(),
})
