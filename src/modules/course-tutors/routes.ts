import { route, files, payloadValidate, query, customParam, id } from '@desmart/js-utils'
import Validation from './validation/schema'
import Actions from './actions'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheckSoft } from '../../middleware/global-permission'
import { authAdmin } from '../../middleware/authorize'
import { checkCourseAdminByPayload } from '../../middleware/check-course-admin'

export default app => {
  app.post('/course-tutors', authAdmin, permCheckSoft(GlobalPerms.X), checkCourseAdminByPayload(['course_id'], [GlobalPerms.X]), route(Actions.createTutor, [payloadValidate(Validation.createTutor), files]))

  app.get('/course-tutors/course/:course_id', authAdmin, route(Actions.fetchAllTutors, [customParam('course_id'), query]))
  app.get('/course-tutors/:id', authAdmin, route(Actions.fetchTutor, [id]))

  app.patch('/course-tutors/:id', authAdmin, route(Actions.updateTutor, [id, payloadValidate(Validation.updateTutor), files]))
  app.patch('/course-tutors/:id/toggle-is-active', authAdmin, route(Actions.toggleTutorIsActive, [id]))

  app.delete('/course-tutors/:id', authAdmin, route(Actions.deleteTutor, [id]))
}
