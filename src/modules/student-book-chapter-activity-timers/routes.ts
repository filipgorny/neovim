import { customParam, payloadValidate, route, studentCourse, user } from '../../../utils/route/attach-route'
import upsertChapterActivityTimer from './actions/upsert-chapter-activity-timer'
import { authStudent } from '../../middleware/authorize'

import { schema as upsertChapterActivityTimerSchema } from './validation/schema/upsert-chapter-activity-timer-schema'
import { studentCourseContext } from '../../middleware/student-course-context'

export default app => {
  app.patch(
    '/activity-timers/chapter/:chapter_id',
    authStudent,
    studentCourseContext,
    route(
      upsertChapterActivityTimer,
      [
        user,
        customParam('chapter_id'),
        studentCourse,
        payloadValidate(upsertChapterActivityTimerSchema),
      ]
    ))
}
