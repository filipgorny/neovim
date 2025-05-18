import Joi from 'joi'
import { CourseMapTypes } from '../../course-map-types'

export const schema = Joi.object({
  title: Joi.string().required(),
  external_id: Joi.string().required(),
  type: Joi.string().valid(
    CourseMapTypes.liveCourse,
    CourseMapTypes.onDemandCourse,
    CourseMapTypes.freeTrial,
    CourseMapTypes.product
  ).required(),
  metadata: Joi.object(),
})
