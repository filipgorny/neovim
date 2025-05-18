import { route, customParam } from '@desmart/js-utils'
import { authMasterAdmin } from '../../middleware/authorize'
import Actions from './actions'

export default app => {
  app.post('/admin-courses/admin/:admin_id/course/:course_id/toggle', authMasterAdmin, route(Actions.toggleCourseAccess, [customParam('admin_id'), customParam('course_id')]))
}
