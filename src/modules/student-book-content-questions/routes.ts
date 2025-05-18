import { customParam, id, payload, route, user } from '@desmart/js-utils/dist/route'
import { authRealStudent } from '../../middleware/authorize'
import answerContentQuestion from './actions/answer-content-question'
import resetSingleContentQuestion from './actions/reset-single-content-question'
import getChapterResetCost from './actions/get-chapter-reset-cost'
import resetQuestionsInChapter from './actions/reset-questions-in-chapter'
import { studentCourseContext } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'
import upsertAnswer from './actions/upsert-answer'

export default app => {
  app.patch('/student-book-content-questions/:id/answer', authRealStudent, studentCourseContext, route(answerContentQuestion, [id, user, payload, studentCourse]))
  app.patch('/student-book-content-questions/:question_id/reset', authRealStudent, studentCourseContext, route(resetSingleContentQuestion, [customParam('question_id'), user, studentCourse]))

  app.get('/student-book-content-questions/chapter-reset-cost/:chapter_id', authRealStudent, route(getChapterResetCost, [customParam('chapter_id'), user]))

  app.post('/student-book-content-questions/chapter-reset/:chapter_id', authRealStudent, route(resetQuestionsInChapter, [customParam('chapter_id'), user]))
  app.post('/student-book-content-questions/book_content_question_id/:book_content_question_id/upsert-answer', authRealStudent, studentCourseContext, route(upsertAnswer, [customParam('book_content_question_id'), studentCourse, payload, user]))
}
