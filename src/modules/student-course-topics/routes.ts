import { customParam, id, payload, query } from '@desmart/js-utils'
import { route, studentCourse } from '../../../utils/route/attach-route'
import { authRealStudent, authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import Actions from './actions'

export default app => {
  app.get('/student-course-topics', authStudent, studentCourseContext, route(Actions.fetchAllStudentCourseTopics, [studentCourse, query]))
  app.get('/student-course-topics/content/:student_book_content_id', authStudent, studentCourseContext, route(Actions.fetchByBookContent, [studentCourse, customParam('student_book_content_id')]))

  app.patch('/student-course-topics/:id/is-mastered', authRealStudent, route(Actions.toggleIsMastered, [id, payload]))
}
