import { route, payloadValidate, user, id } from '@desmart/js-utils'
import Actions from './actions'
import Validation from './validation/schema'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'

export default app => {
  app.post('/student-flashcard-boxes', authStudent, studentCourseContext, route(Actions.createFlashcardBox, [user, studentCourse, payloadValidate(Validation.createFlashcardBox)]))

  app.get('/student-flashcard-boxes', authStudent, studentCourseContext, route(Actions.fetchFlashcardBoxes, [studentCourse]))

  app.patch('/student-flashcard-boxes/:id', authStudent, studentCourseContext, route(Actions.updateFlashcardBox, [id, studentCourse, payloadValidate(Validation.updateFlashcardBox)]))

  app.delete('/student-flashcard-boxes/:id', authStudent, studentCourseContext, route(Actions.deleteFlashcardBox, [id, studentCourse]))
}
