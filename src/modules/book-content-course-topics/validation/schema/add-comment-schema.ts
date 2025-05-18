import Joi from 'joi'

export const schema = Joi.object({
  comment_raw: Joi.string(),
  comment_html: Joi.string(),
  comment_delta_object: Joi.object(),
})
