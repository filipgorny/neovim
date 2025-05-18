import Joi from 'joi'

export const schema = Joi.object({
  contentId: Joi.string().uuid().required(),
  order: Joi.number().required(),
  mainCaption: Joi.string().allow(''),
  secondaryCaption: Joi.string().allow(''),
})

export const fileSchema = Joi.object({
  image: Joi.required(),
})
