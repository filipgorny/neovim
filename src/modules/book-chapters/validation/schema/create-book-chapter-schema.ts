import Joi from 'joi'

export const schema = Joi.object({
  bookId: Joi.string().uuid().required(),
  title: Joi.string().required(),
  order: Joi.number().positive(),
})
