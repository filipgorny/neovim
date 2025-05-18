import Joi from 'joi'

export const schema = Joi.object({
  category_id: Joi.string().uuid().required(),
  title: Joi.string().required(),
})
