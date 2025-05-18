import { route, studentCourse } from '../../../utils/route/attach-route'
import Actions from './actions'
import Validation from './validation/schema'
import { studentCourseContext } from '../../middleware/student-course-context'
import { authStudent } from '../../middleware/authorize'
import { id, payloadValidate } from '@desmart/js-utils'

export default app => {
  app.post('/student-course-end-date-days', authStudent, studentCourseContext, route(Actions.createStudentEndDateDay, [studentCourse, payloadValidate(Validation.createStudentEndDateDay)]))

  app.delete('/student-course-end-date-days/:id', authStudent, studentCourseContext, route(Actions.deleteStudentEndDateDay, [studentCourse, id]))
}
