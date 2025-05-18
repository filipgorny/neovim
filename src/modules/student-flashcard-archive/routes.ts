import { customParam, payload, user } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import Actions from './actions'

export default app => {
  app.patch('/student-flashcard-archive/bulk-unarchive', authStudent, route(Actions.bulkUnarchive, [payload, user]))
  app.patch('/student-flashcard-archive/:student_flashcard_id/archive', authStudent, route(Actions.archiveStudentFlashcard, [customParam('student_flashcard_id'), user]))
  app.patch('/student-flashcard-archive/:student_flashcard_id/unarchive', authStudent, route(Actions.unarchiveStudentFlashcard, [customParam('student_flashcard_id'), user]))

  app.get('/student-flashcard-archive/course/:student_course_id/get-snapshot', authStudent, route(Actions.getSnapshot, [customParam('student_course_id'), user]))
}
