import { route, customParam, payloadValidate, routeRaw, user, query } from '@desmart/js-utils'
import { authStudent } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { studentCourseContext } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'

export default app => {
  app.post('/chat-bot/send', authStudent, route(Actions.sendMessage, [user, payloadValidate(Validation.sendMessage)]))
  app.post('/chat-bot/send-stream', authStudent, studentCourseContext, routeRaw(Actions.sendMessageStream, [user, payloadValidate(Validation.sendMessage), studentCourse]))

  app.get('/chat-bot/history/:student_book_chapter_id', authStudent, route(Actions.getHistory, [user, customParam('student_book_chapter_id'), query]))
}
