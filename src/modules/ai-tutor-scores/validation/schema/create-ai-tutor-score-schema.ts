import Joi from 'joi'

export const schema = Joi.object({
  score: Joi.number().required(),
  student_book_chapter_id: Joi.string().uuid().required(),
})
