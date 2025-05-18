import Joi from 'joi'

export const schema = Joi.object({
  mainCaption: Joi.string().allow(''),
  secondaryCaption: Joi.string().allow(''),
})

export const fileSchema = Joi.object({
  image: Joi.required(),
})
