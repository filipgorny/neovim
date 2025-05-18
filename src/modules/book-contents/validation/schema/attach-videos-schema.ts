import Joi from 'joi'

export const schema = Joi.object({
  ids: Joi.array().items(
    Joi.string().uuid()
  ).required(),
})
