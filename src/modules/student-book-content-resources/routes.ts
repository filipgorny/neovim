import { authStudent } from '../../middleware/authorize'
import { id, payload, payloadValidate, route, studentCourse, studentId } from '../../../utils/route/attach-route'
import updateBookResource from './actions/update-book-resource'
import markResourceAsRead from './actions/mark-resource-as-read'

import { schema as updateBookResourceSchema } from './validation/update-book-content-resource-schema'
import { studentCourseContext } from '../../middleware/student-course-context'

export default (app) => {
  app.patch('/student-book-content-resources/:id', authStudent, route(updateBookResource, [studentId, id, payloadValidate(updateBookResourceSchema)]))
  app.patch('/student-book-content-resources/:id/read', authStudent, studentCourseContext, route(markResourceAsRead, [studentId, id, studentCourse]))
}
