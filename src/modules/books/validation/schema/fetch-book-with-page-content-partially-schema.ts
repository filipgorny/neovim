import Joi from 'joi'

export const schema = Joi.array().items(
  Joi.string().valid('book', 'topics', 'chapters', 'chapterImages', 'subchapters', 'contents', 'resources', 'attachments', 'questions', 'images', 'flashcards', 'comments')
).required()
