import Joi from 'joi'

export const schema = Joi.object({
  course_id: Joi.string().uuid().required(),
  chapter_ids: Joi.array().items(
    Joi.string().uuid()
  ).required(),
})
