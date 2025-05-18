import Joi from 'joi'

export const schema = Joi.object({
  table: Joi.string().required().valid('glossary', 'flashcards', 'book_contents'),
  column: Joi.string().required().valid('phrase_html', 'explanation_html', 'question_html', 'content_html'),
  html: Joi.string().required(),
})
