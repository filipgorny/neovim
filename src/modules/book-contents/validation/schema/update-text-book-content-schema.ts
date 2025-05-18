import Joi from 'joi'

export const schema = Joi.object({
  raw: Joi.string().required(),
  delta_object: Joi.any().required(),
  content_html: Joi.any().optional(),
})
