import { route, id, user, payload, files, payloadValidate, studentCourse } from '../../../utils/route/attach-route'
import { authStudent, authRealStudent } from '../../middleware/authorize'
import fetchQuestion from './actions/fetch-question'
import toggleFlagged from './actions/toggle-flagged'
import changeStatus from './actions/change-status'
import changeAnswer from './actions/change-answer'
import updateQuestionCanvas from './actions/update-canvas'

import { schema as updateQuestionCanvasSchema } from './validation/schema/update-canvas-schema'
import { schema as changeStatusSchema } from './validation/schema/change-status-schema'
import { studentCourseContextOptional } from '../../middleware/student-course-context'

export default app => {
  app.get('/student-exam-questions/:id', authStudent, route(fetchQuestion, [id, user]))
  app.patch('/student-exam-questions/:id/canvas', authStudent, route(updateQuestionCanvas, [id, user, files, payloadValidate(updateQuestionCanvasSchema)]))
  app.patch('/student-exam-questions/:id/toggle-flagged', authRealStudent, route(toggleFlagged, [id, user]))
  app.patch('/student-exam-questions/:id/status', authRealStudent, route(changeStatus, [id, user, payloadValidate(changeStatusSchema)]))
  app.patch('/student-exam-questions/:id/answer', authRealStudent, studentCourseContextOptional, route(changeAnswer, [id, user, payload, studentCourse]))
}
