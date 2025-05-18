import { route, payloadValidate, user, query, id, customParam } from '@desmart/js-utils/dist/route'
import { studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/student-book-content-pins', authStudent, route(Actions.createPinNote, [user, payloadValidate(Validation.createPinNote)]))

  app.get('/student-book-content-pins/content/:id', authStudent, route(Actions.fetchPinNotes, [user, id, query]))
  app.get('/student-book-content-pins/book/:id/count', authStudent, studentCourseContext, route(Actions.countPinNotesByBook, [studentCourse, id]))
  app.get('/student-book-content-pins/count', authStudent, studentCourseContext, route(Actions.countPinNotesInCourse, [studentCourse]))
  app.get('/student-book-content-pins/book/:id', authStudent, route(Actions.fetchPinNotesByBook, [id, query]))
  app.get('/student-book-content-pins/book/:id/subchapter/:subchapter_id', authStudent, route(Actions.fetchPinNotesBySubchapter, [id, customParam('subchapter_id'), query]))
  app.get('/student-book-content-pins/course', authStudent, studentCourseContext, route(Actions.fetchPinNotesByCourse, [studentCourse, query]))
  app.get('/student-book-content-pins/:id', authStudent, route(Actions.fetchOnePinNote, [user, id]))

  app.patch('/student-book-content-pins/:id', authStudent, route(Actions.updatePinNote, [user, id, payloadValidate(Validation.updatePinNote)]))

  app.delete('/student-book-content-pins/:id', authStudent, route(Actions.deletePinNote, [user, id]))
}
