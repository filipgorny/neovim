import { customParam, payloadValidate } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheckSoft } from '../../middleware/global-permission'
import { checkCourseAdminByPayload } from '../../middleware/check-course-admin'

export default app => {
  app.post('/calendar-chapters/set-order', authAdmin, permCheckSoft(GlobalPerms.X), checkCourseAdminByPayload(['course_id'], [GlobalPerms.X]), route(Actions.setOrderForCourse, [payloadValidate(Validation.setOrderForCourse)]))

  app.get('/calendar-chapters/course/:course_id', authStudentOrAdmin, route(Actions.fetchChaptersForCourse, [customParam('course_id')]))
}
