import Joi from 'joi'

export const schema = Joi.object({
  content_delta_object: Joi.object().required(),
  content_raw: Joi.string().required(),
  content_html: Joi.string().required(),
})
