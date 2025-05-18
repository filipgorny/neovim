import Joi from 'joi'
import { StudentCourseTypes } from '../../../student-courses/student-course-types'
import { DATE_REGEXP_YMD } from '../../../../constants'

export const schema = Joi.array().items(
  Joi.object({
    type: Joi.string().valid(StudentCourseTypes.liveCourse).required(),
    course_id: Joi.string().uuid().required(),
    expires_at: Joi.string().pattern(DATE_REGEXP_YMD).optional(),
    end_date_id: Joi.string().uuid().optional(),
    semester_name: Joi.string().optional(),
  }).optional(),
  Joi.object({
    type: Joi.string().valid(StudentCourseTypes.freeTrial, StudentCourseTypes.onDemand).required(),
    course_id: Joi.string().uuid().required(),
    days_amount: Joi.number().optional(),
    semester_name: Joi.string().optional(),
  }).optional()
)
