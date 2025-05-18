import Joi from 'joi'
import { BookContentResourceTypeEnum } from '../../book-contennt-resource-types'

export const schema = Joi.object({
  type: Joi.string().valid(BookContentResourceTypeEnum.video).required(),
  contentId: Joi.string().uuid().required(),
  videoId: Joi.string().uuid().required(),
})
