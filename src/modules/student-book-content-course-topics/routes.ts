import { customParam, id, payloadValidate, route } from '@desmart/js-utils'
import { studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.get('/student-content-topics/book-content/:student_book_content_id', authStudent, studentCourseContext, route(Actions.fetchAllByBookContent, [studentCourse, customParam('student_book_content_id')]))

  app.patch('/student-content-topics/:id/read', authStudent, route(Actions.markAsRead, [id, payloadValidate(Validation.markTopicsAsRead)]))
}
