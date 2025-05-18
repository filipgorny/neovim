import { route, studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import getChapterScores from './actions/get-chapter-scores'

export default app => {
  app.get('/chat-chapter-scores', authStudent, studentCourseContext, route(getChapterScores, [studentCourse]))
}
