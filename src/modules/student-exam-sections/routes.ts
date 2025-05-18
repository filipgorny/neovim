import { route, user, id, payload, payloadValidate } from '../../../utils/route/attach-route'
import { authStudent, authRealStudent } from '../../middleware/authorize'
import changeStatus from './actions/change-status'
import timePerQuestion from './actions/time-per-question'
import timePerPassage from './actions/time-per-passage'
import getPassageReadingTimeGraphData from './actions/get-passage-reading-time-graph-data'
import getPassageWorkingTime from './actions/get-passage-working-time'

import { schema as changeStatusSchema } from './validation/schema/change-status-schema'

export default app => {
  app.patch('/student-exam-sections/:id/status', authRealStudent, route(changeStatus, [user, id, payloadValidate(changeStatusSchema)]))

  app.get('/student-exam-sections/:id/graph/questions', authStudent, route(timePerQuestion, [user, id]))
  app.get('/student-exam-sections/:id/time-per-passage', authStudent, route(timePerPassage, [user, id]))
  app.get('/student-exam-sections/:id/graph/passage-reading-time', authStudent, route(getPassageReadingTimeGraphData('reading'), [user, id]))
  app.get('/student-exam-sections/:id/graph/passage-working-time', authStudent, route(getPassageReadingTimeGraphData('working'), [user, id]))
  app.get('/student-exam-sections/:id/graph/passages', authStudent, route(getPassageWorkingTime, [user, id]))
}
