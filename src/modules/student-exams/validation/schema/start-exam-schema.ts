import Joi from 'joi'
import {
  EXAM_TIME_OPTION_100,
  EXAM_TIME_OPTION_125,
  EXAM_TIME_OPTION_150,
  EXAM_TIME_OPTION_200
} from '../../exam-time-options'

export const schema = Joi.object({
  time_option: Joi.string().valid(
    EXAM_TIME_OPTION_100,
    EXAM_TIME_OPTION_125,
    EXAM_TIME_OPTION_150,
    EXAM_TIME_OPTION_200
  ).required()
})
