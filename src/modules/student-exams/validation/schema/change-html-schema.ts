import Joi from 'joi'

import { CONTENT_TYPE_ANSWERS, CONTENT_TYPE_PASSAGE, CONTENT_TYPE_QUESTION } from '../../changable-content-types'

export const schema = Joi.object({
  resource_id: Joi.string().uuid().required(),
  content_type: Joi.string().required().valid(CONTENT_TYPE_QUESTION, CONTENT_TYPE_ANSWERS, CONTENT_TYPE_PASSAGE),
  content: Joi.string().required()
})
