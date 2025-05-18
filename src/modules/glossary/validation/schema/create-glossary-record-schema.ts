import Joi from 'joi'

export const schema = Joi.object({
  phrase_raw: Joi.string().required(),
  explanation_raw: Joi.string().required(),
  phrase_delta_object: Joi.string().required(),
  explanation_delta_object: Joi.string().required(),
  phrase_html: Joi.string().required(),
  explanation_html: Joi.string().required(),
})
