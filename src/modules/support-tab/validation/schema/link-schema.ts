import Joi from 'joi'

export const schema = Joi.object({
  link: Joi.string().required(),
})
