import Joi from 'joi'

export const schema = Joi.object({
  chapter_ids: Joi.array().items(
    Joi.string().uuid()
  ).required(),
})
