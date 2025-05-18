import Joi from 'joi'
import { BookContentResourceTypeEnum } from '../../book-contennt-resource-types'

export const schema = Joi.object({
  type: Joi.string().valid(BookContentResourceTypeEnum.tmi, BookContentResourceTypeEnum.clinical_context, BookContentResourceTypeEnum.mcat_think).required(),
  contentId: Joi.string().uuid().required(),
  raw: Joi.string().required(),
  delta_object: Joi.object().required(),
})
