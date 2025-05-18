import { id, payloadValidate, query, route } from '@desmart/js-utils'
import Actions from './actions'
import Validation from './validation/schema'
import { studentCourse } from '../../../utils/route/attach-route'
import { studentCourseContext } from '../../middleware/student-course-context'
import { authStudent } from '../../middleware/authorize'

export default app => {
  app.post('/student-calendar-days-off', authStudent, studentCourseContext, route(Actions.createDayOff, [studentCourse, payloadValidate(Validation.createDayOff)]))
  app.post('/student-calendar-days-off/many', authStudent, studentCourseContext, route(Actions.createManyDaysOff, [studentCourse, payloadValidate(Validation.createManyDaysOff)]))

  app.get('/student-calendar-days-off', authStudent, studentCourseContext, route(Actions.fetchAllDaysOff, [studentCourse, query]))

  app.delete('/student-calendar-days-off/:id', authStudent, studentCourseContext, route(Actions.deleteDayOff, [studentCourse, id]))
}
