import Joi from 'joi'

export const fileSchema = Joi.object({
  image: Joi.required(),
})
