import Joi from 'joi'

export const schema = Joi.object({
  videoId: Joi.string().uuid().required(),
})
