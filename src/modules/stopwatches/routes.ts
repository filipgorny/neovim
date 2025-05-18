import { id, payload, payloadValidate, route, studentCourse, studentId, user } from '../../../utils/route/attach-route'
import updateStopwatch from './actions/update-stopwatch'
import getStopwatch from './actions/get-stopwatch'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'

import { schema as updateStopwatchSchema } from './validation/schema/update-stopwatch-schema'

export default app => {
  app.patch('/stopwatches', authStudent, studentCourseContext, route(updateStopwatch, [user, studentCourse, payloadValidate(updateStopwatchSchema)]))

  app.get('/stopwatches', authStudent, studentCourseContext, route(getStopwatch, [user, studentCourse]))
}
