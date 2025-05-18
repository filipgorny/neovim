import { route, query, payloadValidate, id, customParam } from '@desmart/js-utils'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { studentCourseContextOptional } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'

export default app => {
  app.post('/custom-event-groups', authAdmin, route(Actions.createCustomEventGroup, [payloadValidate(Validation.createCustomEventGroup)]))

  app.get('/custom-event-groups', authStudentOrAdmin, studentCourseContextOptional, route(Actions.fetchAllCustomEventGroups, [query, studentCourse]))
  app.get('/custom-event-groups/:id', authAdmin, route(Actions.fetchCustomEventGroup, [id]))

  app.patch('/custom-event-groups/:id', authAdmin, route(Actions.updateCustomEventGroup, [id, payloadValidate(Validation.updateCustomEventGroup)]))
  app.patch('/custom-event-groups/:course_id/group/:id/reorder/:direction', authAdmin, route(Actions.reorderCustomEventGroup, [customParam('course_id'), id, customParam('direction')]))

  app.delete('/custom-event-groups/:id', authAdmin, route(Actions.deleteCustomEventGroup, [id]))
}
