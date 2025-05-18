import Joi from 'joi'

export const schema = Joi.object({
  search: Joi.string().required(),
})
