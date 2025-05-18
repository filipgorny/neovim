import Joi from 'joi'
import { StudentCourseTypes } from '../../student-course-types'
import { DATE_REGEXP_YMD } from '../../../../constants'

export const schema = Joi.object({
  transaction_id: Joi.string().optional(),
  external_id: Joi.string().required(),
  external_created_at: Joi.string().required(),
  type: Joi.string().valid(...Object.values(StudentCourseTypes)).required(),
  metadata: [
    Joi.object({
      expires_at: Joi.string().pattern(DATE_REGEXP_YMD).required(),
    }),
    Joi.object({
      days_amount: Joi.string().required(),
    }),
  ],
})
