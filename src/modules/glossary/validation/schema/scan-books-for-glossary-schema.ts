import Joi from 'joi'

export const schema = Joi.object({
  limit: Joi.object({
    take: Joi.number(),
    page: Joi.number(),
  }),
  order: Joi.object({
    by: Joi.string().valid('id', 'raw', 'delta_object', 'type', 'book_title', 'chapter_order', 'part', 'subchapter_order', 'subchapter_title', 'content_order', 'resource_order'),
    dir: Joi.string().valid('asc', 'desc'),
  }),
})
