import { route, id, payloadValidate, query, customParam } from '@desmart/js-utils'
import { studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/student-calendar-events', authStudent, studentCourseContext, route(Actions.createCalendarEvent, [studentCourse, payloadValidate(Validation.createCalendarEvent)]))
  app.post('/student-calendar-events/complex', authStudent, studentCourseContext, route(Actions.createComplexCalendarEvent, [studentCourse, payloadValidate(Validation.createComplexCalendarEvent)]))
  app.post('/student-calendar-events/pre-reading', authStudent, studentCourseContext, route(Actions.buildPreReading, [studentCourse, payloadValidate(Validation.buildPreReading)]))
  app.post('/student-calendar-events/live-class', authStudent, studentCourseContext, route(Actions.buildLiveClass, [studentCourse]))

  app.patch('/student-calendar-events/reorder', authStudent, studentCourseContext, route(Actions.reorderCalendarEvents, [studentCourse, payloadValidate(Validation.reorderCalendarEvent)]))
  app.patch('/student-calendar-events/:id', authStudent, studentCourseContext, route(Actions.updateCalendarEvent, [studentCourse, id, payloadValidate(Validation.updateCalendarEvent)]))

  app.get('/student-calendar-events', authStudent, studentCourseContext, route(Actions.fetchAllCalendarEvents, [studentCourse, query]))
  app.get('/student-calendar-events/manual/:force_rebuild?', authStudent, studentCourseContext, route(Actions.getForManualBuild, [studentCourse, query, customParam('force_rebuild')]))
  app.get('/student-calendar-events/:id', authStudent, studentCourseContext, route(Actions.fetchCalendarEvent, [studentCourse, id]))
  app.get('/student-calendar-events/date/:date', authStudent, studentCourseContext, route(Actions.fetchCalendarEventsByDate, [studentCourse, query, customParam('date')]))

  app.delete('/student-calendar-events/:id', authStudent, studentCourseContext, route(Actions.deleteCalendarEvent, [studentCourse, id]))
}
