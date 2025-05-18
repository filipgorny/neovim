import Joi from 'joi'
import { BookContentAttachmentTypeEnum } from '../../book-content-attachment-types'

export const schema = Joi.object({
  contentId: Joi.string().uuid().required(),
  type: Joi.string().valid(BookContentAttachmentTypeEnum.main_text, BookContentAttachmentTypeEnum.salty_comment).required(),
  raw: Joi.string().required(),
  delta_object: Joi.object().required(),
  order: Joi.number().required(),
})
