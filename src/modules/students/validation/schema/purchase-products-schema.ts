import Joi from 'joi'
import { schema as purchaseExamSchema } from '../../../student-exams/validation/schema/purchase-exam-schema'
import { schema as purchaseCourseSchema } from '../../../student-courses/validation/schema/purchase-course-schema'
import { schema as purchaseExtentionSchema } from '../../../student-courses/validation/schema/purchase-extention-schema'

export const schema = Joi.object({
  courses: Joi.array().items(purchaseCourseSchema).optional(),
  exams: Joi.array().items(purchaseExamSchema).optional(),
  extentions: Joi.array().items(purchaseExtentionSchema).optional(),
})
