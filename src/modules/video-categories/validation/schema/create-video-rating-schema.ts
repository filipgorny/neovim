import Joi from 'joi'
import { CourseMapTypes } from '../../../course-map/course-map-types'

export const schema = Joi.object({
  title: Joi.string().required(),
  course_id: Joi.string().uuid().required(),
  course_type: Joi.string().valid(...Object.values(CourseMapTypes)).required(),
  end_date_id: Joi.string().uuid().optional(),
})
