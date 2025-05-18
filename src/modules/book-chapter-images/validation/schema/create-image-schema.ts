import Joi from 'joi'

export const schema = Joi.object({
  chapterId: Joi.string().uuid().required(),
})

export const fileSchema = Joi.object({
  image: Joi.any(),
  smallVer: Joi.any(),
})
