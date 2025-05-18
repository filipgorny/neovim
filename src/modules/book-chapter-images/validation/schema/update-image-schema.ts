import Joi from 'joi'

export const schema = Joi.object({
  image: Joi.allow(null),
  smallVer: Joi.allow(null),
})

export const fileSchema = Joi.object({
  image: Joi.any(),
  smallVer: Joi.any(),
})
