import Joi from 'joi'

export const schema = Joi.object({
  raw: Joi.string().required(),
  skipIds: Joi.array().items(
    Joi.string()
  ).required(),
})
