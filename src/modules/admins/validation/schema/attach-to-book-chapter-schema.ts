import Joi from 'joi'

export const schema = Joi.object({
  admin_ids: Joi.array().items(
    Joi.string().uuid()
  ).required(),
})
