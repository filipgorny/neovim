import Joi from 'joi'

export const schema = Joi.object({
  limit: Joi.object({
    take: Joi.number().required(),
    page: Joi.number().required(),
  }).optional(),
  order: Joi.object({
    by: Joi.string().valid('id', 'phrase', 'category', 'image_hint', 'created_at', 'updated_at', 'deleted_at').required(),
    dir: Joi.string().valid('asc', 'desc').required(),
  }).optional(),
  filter: Joi.any().optional(),
})
