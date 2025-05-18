import Joi from 'joi'

export const schema = Joi.object({
  message: Joi.string().required(),
  student_book_chapter_id: Joi.string().uuid().required(),
})
