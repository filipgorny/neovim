import { route, user, id } from '@desmart/js-utils/dist/route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import toggleIsCompleted from './actions/toggle-is-completed'
import fetchAllTasks from './actions/fetch-all-tasks'

export default app => {
  app.get('/student-tasks', authStudent, studentCourseContext, route(
    fetchAllTasks, [
      user,
    ]
  ))

  app.patch('/student-tasks/:id/toggle-completed', authStudent, studentCourseContext, route(
    toggleIsCompleted, [
      id,
    ]
  ))
}
