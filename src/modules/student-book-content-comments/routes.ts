import { customParam, route } from '@desmart/js-utils'
import { studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import Actions from './actions'

export default app => {
  app.get('/student-book-content-comments/:book_content_id', authStudent, studentCourseContext, route(Actions.fetchComment, [studentCourse, customParam('book_content_id')]))

  app.patch('/student-book-content-comments/:book_content_id/read', authStudent, studentCourseContext, route(Actions.markCommentAsRead, [studentCourse, customParam('book_content_id')]))
}
