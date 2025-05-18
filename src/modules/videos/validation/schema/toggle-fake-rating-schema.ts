import Joi from 'joi'

export const schema = Joi.object({
  use_fake_rating: Joi.boolean().required(),
})
