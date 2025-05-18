import Joi from 'joi'

export const fileSchema = Joi.object({
  file: Joi.required(),
})
