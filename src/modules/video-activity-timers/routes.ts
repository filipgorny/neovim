import { customParam, payloadValidate, route, studentCourse, user } from '../../../utils/route/attach-route'
import upsertVideoActivityTimer from './actions/upsert-video-activity-timer'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'

import { schema as upsertVideoActivityTimerSchema } from './validation/schema/upsert-video-activity-timer-schema'

export default app => {
  app.patch(
    '/activity-timers/video/:video_id',
    authStudent,
    studentCourseContext,
    route(
      upsertVideoActivityTimer,
      [
        user,
        customParam('video_id'),
        studentCourse,
        payloadValidate(upsertVideoActivityTimerSchema),
      ]
    ))
}
