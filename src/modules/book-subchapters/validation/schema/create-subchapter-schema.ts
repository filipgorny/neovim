import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().required(),
  chapterId: Joi.string().uuid().required(),
  part: Joi.number().min(1).required(),
  order: Joi.number().positive(),
})
