import { customParam, payloadValidate, route } from '@desmart/js-utils'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { studentCourseContextOptional } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheckSoft } from '../../middleware/global-permission'
import { checkCourseAdminByPayload } from '../../middleware/check-course-admin'

export default app => {
  app.post('/calendar-section-exams/set-order', authAdmin, permCheckSoft(GlobalPerms.X), checkCourseAdminByPayload(['course_id'], [GlobalPerms.X]), route(Actions.setOrderForCourse, [payloadValidate(Validation.setOrderForCourse)]))

  app.get('/calendar-section-exams/course/:course_id', authStudentOrAdmin, studentCourseContextOptional, route(Actions.fetchSectionExamsForCourse, [customParam('course_id'), studentCourse]))
}
