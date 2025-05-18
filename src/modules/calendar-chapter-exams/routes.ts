import { customParam, payloadValidate } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/calendar-chapter-exams/set-order', authAdmin, route(Actions.setOderForCourse, [payloadValidate(Validation.setOrderForCourse)]))

  app.get('/calendar-chapter-exams/course/:course_id', authStudentOrAdmin, route(Actions.fetchChapterExamsForCourse, [customParam('course_id')]))
}
