import * as R from 'ramda'
import moment from 'moment'
import { query, request, customParam, id, payloadValidate, route, files, user } from '@desmart/js-utils'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck, permCheckSoft } from '../../middleware/global-permission'
import { addWeekdayFromClassDate } from '../../../services/weekday/weekday-transformer'
import { studentCourseContextOptional } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'
import { checkCourseAdminByPayload, checkCourseAdminByUrlParam, checkCourseAdminComplex } from '../../middleware/check-course-admin'
import { findOne as findEntity } from './course-end-dates-repository'

const addWeekdays = R.map(R.over(R.lensProp('days'), addWeekdayFromClassDate))

export default app => {
  app.post('/course-end-dates', authAdmin, permCheckSoft(GlobalPerms.X), checkCourseAdminByPayload(['course_id'], [GlobalPerms.X]), route(Actions.createCourseEndDate, [payloadValidate(Validation.createCourseEndDateSchema), files]))

  app.get('/course-end-dates/course/:course_id/years', authAdmin, route(Actions.getPossibleYearsForCourse, [customParam('course_id')]))
  app.get('/course-end-dates/course/:course_id/year/:year', authStudentOrAdmin, studentCourseContextOptional, route(Actions.getCourseEndDatesForYear, [customParam('course_id'), customParam('year'), query, studentCourse], [addWeekdays]))
  app.get('/course-end-dates/course/:course_id', authStudentOrAdmin, route(Actions.getCourseEndDatesForYear, [customParam('course_id'), () => moment().format('YYYY'), query], [addWeekdays]))
  app.get('/course-end-dates/course/:course_id/liki', route(Actions.getCourseEndDatesByLiki, [request, customParam('course_id'), query]))
  app.get('/course-end-dates/course/:course_id/end-date/exists', authAdmin, route(Actions.checkCourseEndDateExists, [customParam('course_id'), payloadValidate(Validation.modifyEndDateSchema)]))
  app.get('/course-end-dates/course/:course_id/end-date/students', authAdmin, route(Actions.getStudentsByCourseEndDate, [customParam('course_id'), payloadValidate(Validation.modifyEndDateSchema)]))
  app.get('/course-end-dates/course/:course_id/all', authStudentOrAdmin, route(Actions.getAllCourseEndDates, [customParam('course_id'), query]))
  // app.get('/course-end-dates/:id/upcoming', authStudent, route(Actions.fetchUpcomingClasses, [id])) unused, maybe in the future

  app.patch('/course-end-dates/:id/end-date', authAdmin, permCheckSoft(GlobalPerms.X), checkCourseAdminComplex(findEntity), route(Actions.modifyEndDate, [id, payloadValidate(Validation.modifyEndDateSchema)]))
  app.patch('/course-end-dates/:id/start-date', authAdmin, permCheck(GlobalPerms.X), checkCourseAdminComplex(findEntity), route(Actions.modifyStartDate, [id, payloadValidate(Validation.modifyStartDateSchema)]))
  app.patch('/course-end-dates/:id/calendar-image', authAdmin, route(Actions.modifyCalendarImageUrl, [id, files]))
  app.patch('/course-end-dates/:id/meeting-url', authAdmin, permCheck(GlobalPerms.X), checkCourseAdminComplex(findEntity), route(Actions.modifyMeetingUrl, [id, payloadValidate(Validation.modifyMeetingUrl)]))
  app.patch('/course-end-dates/:id/semester-name', authAdmin, route(Actions.modifySemesterName, [id, payloadValidate(Validation.modifySemesterName)]))

  app.delete('/course-end-dates/:id', authAdmin, permCheck(GlobalPerms.X), checkCourseAdminComplex(findEntity), route(Actions.deleteCourseEndDate, [id]))
  app.delete('/course-end-dates/course/:course_id', authAdmin, permCheck(GlobalPerms.X), checkCourseAdminByUrlParam(), route(Actions.deleteCourseEndDatesByCourseId, [customParam('course_id')]))
}
