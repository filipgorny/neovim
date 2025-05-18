import Joi from 'joi'
import { BookContentTypeEnum } from '../../book-content-types'

export const schema = Joi.object({
  type: Joi.string().valid(BookContentTypeEnum.main_text, BookContentTypeEnum.salty_comment).required(),
  subchapterId: Joi.string().uuid().required(),
  raw: Joi.string().required(),
  delta_object: Joi.object().required(),
  order: Joi.number().required(),
  content_html: Joi.any().optional(),
})
