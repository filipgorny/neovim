import Joi from 'joi'

export const schema = Joi.object({
  intro_pages: Joi.array().items(
    Joi.object({
      raw: Joi.string().required(),
      delta_object: Joi.object().required(),
    })
  ).required(),
})
