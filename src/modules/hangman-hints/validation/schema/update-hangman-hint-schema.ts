import Joi from 'joi'

export const schema = Joi.object({
  hint_raw: Joi.string().required(),
  hint_delta_object: Joi.any().required(),
  hint_html: Joi.string().required(),
})
