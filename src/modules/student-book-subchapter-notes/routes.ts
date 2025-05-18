import { id, payloadValidate, query, route, studentCourse, studentId } from '../../../utils/route/attach-route'
import fetchAllNotes from './actions/fetch-all-notes'
import { authStudent } from '../../middleware/authorize'
import addOrUpdateNote from './actions/add-or-update-note'
import fetchAllByBook from './actions/fetch-all-by-book'
import fetchAllByCourse from './actions/fetch-all-by-course'
import { studentCourseContext } from '../../middleware/student-course-context'

import { schema as addOrUpdateNoteSchema } from './validation/schema/add-or-update-note-schema'

export default app => {
  app.get('/student-book-subchapter/book/:id/notes', authStudent, route(fetchAllByBook, [studentId, id, query]))
  app.get('/student-book-subchapter/course/notes', authStudent, studentCourseContext, route(fetchAllByCourse, [studentCourse, query]))
  app.get('/student-book-subchapter/:id/notes', authStudent, route(fetchAllNotes, [studentId, id]))

  app.post('/student-book-subchapter/:id/notes', authStudent, route(addOrUpdateNote, [studentId, id, payloadValidate(addOrUpdateNoteSchema)]))
}
