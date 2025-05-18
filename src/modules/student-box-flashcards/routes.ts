import { route, customParam, user, payloadValidate } from '@desmart/js-utils'
import { studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/student-box-flashcards/box/:box_id/flashcard/:student_flashcard_id', authStudent, route(Actions.createBoxFlashcard, [user, customParam('box_id'), customParam('student_flashcard_id')]))

  app.delete('/student-box-flashcards/box/:box_id/flashcard/:student_flashcard_id', authStudent, route(Actions.deleteBoxFlashcard, [user, customParam('box_id'), customParam('student_flashcard_id')]))

  app.patch('/student-box-flashcards/box/:box_id/bulk-delete', authStudent, studentCourseContext, route(Actions.bulkDeleteBoxFlashcards, [studentCourse, customParam('box_id'), payloadValidate(Validation.bulkDeleteBoxFlashcards)]))
}
