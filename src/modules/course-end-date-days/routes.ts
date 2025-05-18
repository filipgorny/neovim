
import Actions from './actions'
import Validation from './validation/schema'
import { authAdmin, authMasterAdmin, authStudent } from '../../middleware/authorize'
import { addWeekdayFromClassDate } from '../../../services/weekday/weekday-transformer'
import { customParam, id, payloadValidate, route, user } from '../../../utils/route/attach-route'
import { checkCourseAdminComplex } from '../../middleware/check-course-admin'
import { findOne as findCourseEndDate } from '../course-end-dates/course-end-dates-repository'
import { findOne as findCourseEndDateDay } from './course_end_date_days-repository'
import { GlobalPerms } from '../admins/admin-global-permissions'

const toJSON = item => item.toJSON()

export default app => {
  app.post('/end-date-days', authAdmin, checkCourseAdminComplex(findCourseEndDate, ['body', 'end_date_id'], ['course_id'], [], [GlobalPerms.X]), route(Actions.createDay, [payloadValidate(Validation.createDay)], [toJSON, addWeekdayFromClassDate]))

  app.get('/end-date-days/:id', authAdmin, route(Actions.fetchOneDay, [id], [addWeekdayFromClassDate]))
  app.get('/end-date-days/:id/student', authStudent, route(Actions.fetchOneDayForStudent, [user, id]))
  app.get('/end-date-days/end-date/:end_date_id', authStudent, route(Actions.fetchAllDaysByEndDate, [user, customParam('end_date_id')]))

  app.patch('/end-date-days/:id', authAdmin, checkCourseAdminComplex(findCourseEndDateDay, ['params', 'id'], ['endDate', 'course_id'], ['endDate']), route(Actions.updateOneDay, [id, payloadValidate(Validation.updateDay)], [toJSON, addWeekdayFromClassDate]))

  app.delete('/end-date-days/:id', authAdmin, checkCourseAdminComplex(findCourseEndDateDay, ['params', 'id'], ['endDate', 'course_id'], ['endDate']), route(Actions.deleteDay, [id]))
}
