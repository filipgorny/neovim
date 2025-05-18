import Joi from 'joi'

export const schema = Joi.object({
  student_book_content_id: Joi.string().uuid().required(),
})
