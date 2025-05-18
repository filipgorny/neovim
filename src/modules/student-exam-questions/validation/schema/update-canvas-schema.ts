import Joi from 'joi'

export const schema = Joi.object({
  canvas: Joi.string().required(),
})

export const fileSchema = Joi.object({
  image: Joi.required(),
})
