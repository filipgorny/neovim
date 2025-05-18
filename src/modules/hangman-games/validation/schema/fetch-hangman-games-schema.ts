import Joi from 'joi'

export const schema = Joi.object({
  limit: Joi.object({
    take: Joi.number().required(),
    page: Joi.number().required(),
  }).optional(),
  order: Joi.object({
    by: Joi.string().valid('id', 'student_id', 'amount_correct', 'amount_incorrect', 'score', 'created_at').required(),
    dir: Joi.string().valid('asc', 'desc').required(),
  }).optional(),
  filter: Joi.any().optional(),
})
