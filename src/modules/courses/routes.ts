import * as R from 'ramda'
import { route, query, id, payloadValidate } from '../../../utils/route/attach-route'
import Actions from './actions'
import Validation from './validation/schema'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck, permCheckSoft } from '../../middleware/global-permission'
import { authAdmin, authMasterAdmin } from '../../middleware/authorize'
import { customParam, payload, user } from '@desmart/js-utils'
import fetchAllSimple from './actions/fetch-all-simple'
import fetchAllSimpleForAdmin from './actions/fetch-all-simple-for-admin'
import { checkCourseAdminByUrlParam } from '../../middleware/check-course-admin'

const imageFile = R.path(['files', 'logo'])
import getCourseBooks from './actions/get-course-books'

export default app => {
  app.post('/book-courses', permCheck(GlobalPerms.X), route(Actions.createCourse, [payloadValidate(Validation.createBookCourse), imageFile]))
  app.post('/book-courses/:id/attach/exams', permCheck(GlobalPerms.X), route(Actions.attachExams, [id, payloadValidate(Validation.attachExams)]))
  app.post('/book-courses/:id/attach/books', permCheck(GlobalPerms.X), route(Actions.attachBooks, [id, payloadValidate(Validation.attachBooks)])) // legacy route
  app.post('/book-courses/:id/book/:book_id', permCheck(GlobalPerms.X), route(Actions.attachBookToCourse, [id, customParam('book_id')]))
  app.post('/book-courses/:id/copy', permCheck(GlobalPerms.X), route(Actions.copyCourse, [id]))

  app.get('/book-courses', authAdmin, route(Actions.fetchCourses, [user, query]))
  app.get('/book-courses/:id', authAdmin, route(Actions.findOneCourse, [id]))
  app.get('/book-courses/list/simple', authAdmin, route(fetchAllSimple))
  app.get('/book-courses/list/simple/admin/:admin_id', authAdmin, route(fetchAllSimpleForAdmin, [customParam('admin_id')]))
  app.get('/book-courses/:id/course-books', route(getCourseBooks, [id]))

  app.patch('/book-courses/:id', authAdmin, permCheckSoft(GlobalPerms.X, GlobalPerms.R), checkCourseAdminByUrlParam(['id'], [GlobalPerms.X, GlobalPerms.R]), route(Actions.updateCourse, [id, payloadValidate(Validation.updateBookCourse), imageFile]))
  app.patch('/book-courses/:id/book/:book_id/free-trial', permCheck(GlobalPerms.X), route(Actions.toggleFreeTrialBook, [id, customParam('book_id')]))
  app.patch('/book-courses/:id/meeting-url', permCheck(GlobalPerms.X), route(Actions.setGroupTuroringMeetingUrl, [id, payload]))
  app.patch('/book-courses/:id/toggle-calendar', permCheck(GlobalPerms.X), route(Actions.toggleCalendar, [id]))
  app.patch('/book-courses/:id/toggle-ai-tutor', authMasterAdmin, route(Actions.toggleAiTutor, [id]))
  app.patch('/book-courses/:id/dashboard-settings', authMasterAdmin, route(Actions.setDashboardSettings, [id, payload]))

  app.delete('/book-courses/:id', permCheck(GlobalPerms.X), route(Actions.deleteCourse, [id]))
  app.delete('/book-courses/:id/book/:book_id', permCheck(GlobalPerms.X), route(Actions.detachBookFromCourse, [id, customParam('book_id')]))
}
