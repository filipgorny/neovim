import { route, payloadValidate, id, user, customParam, query } from '@desmart/js-utils'
import { authAdmin, authStudent, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import deleteOne from './actions/delete-day'
import { addWeekdayFromClassDate } from '../../../services/weekday/weekday-transformer'
import { studentCourseContext } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'

const toJSON = item => item.toJSON()

export default app => {
  app.post('/group-tutoring-days', authAdmin, route(Actions.createDay, [payloadValidate(Validation.createDay)], [toJSON, addWeekdayFromClassDate]))

  app.get('/group-tutoring-days/upcoming', authStudent, studentCourseContext, route(Actions.fetchUpcomingClasses, [studentCourse]))
  app.get('/group-tutoring-days/future-classes', authStudent, studentCourseContext, route(Actions.fetchAllFutureClasses, [studentCourse]))
  app.get('/group-tutoring-days/:id', authAdmin, route(Actions.fetchOneDay, [id], [addWeekdayFromClassDate]))
  app.get('/group-tutoring-days/course/:course_id', authStudentOrAdmin, route(Actions.fetchAllDays, [user, customParam('course_id'), query]))

  app.patch('/group-tutoring-days/:id', authAdmin, route(Actions.updateDay, [id, payloadValidate(Validation.updateDay)], [toJSON, addWeekdayFromClassDate]))

  app.delete('/group-tutoring-days/:id', authAdmin, route(deleteOne, [id]))
}
