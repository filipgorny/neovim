import Joi from 'joi'
import { BookErrataTypeEnum } from '../../../../types/book-errata'

export const schema = Joi.object({
  content_delta_object: Joi.object().required(),
  content_raw: Joi.string().required(),
  content_html: Joi.string().required(),
  subchapter_id: Joi.string().uuid().required(),
  type: Joi.string().allow(BookErrataTypeEnum).required(),
  book_content_id: Joi.string().uuid().optional(),
})
