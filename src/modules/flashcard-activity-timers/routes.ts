import { customParam, payloadValidate, route, studentCourse, user } from '../../../utils/route/attach-route'
import upsertVideoActivityTimer from './actions/upsert-flashcard-activity-timer'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'

import { schema as upsertFlashcardActivityTimerSchema } from './validation/schema/upsert-flashcard-activity-timer-schema'

export default app => {
  app.patch(
    '/activity-timers/flashcard/:flashcard_id',
    authStudent,
    studentCourseContext,
    route(
      upsertVideoActivityTimer,
      [
        user,
        customParam('flashcard_id'),
        studentCourse,
        payloadValidate(upsertFlashcardActivityTimerSchema),
      ]
    ))
}
