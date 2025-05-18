import { QUESTION_STATUS_INCOMPLETE, QUESTION_STATUS_COMPLETE } from '../../question-status'
import Joi from 'joi'

export const schema = Joi.object({
  question_status: Joi.string().valid(QUESTION_STATUS_COMPLETE, QUESTION_STATUS_INCOMPLETE).required()
})
