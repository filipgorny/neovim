import { route, user, id, userId, query, studentCourse, payloadValidate } from '../../../utils/route/attach-route'
import { authRealStudent, authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import answerFlashcard from './actions/answer-flashcard'
import fetchAllFlashcards from './actions/fetch-all-flashcards'
import fetchAllArchivedFlashcards from './actions/fetch-all-archived-flashcards'
import resetFlashcards from './actions/reset-flashcards'
import studyFlashcards from './actions/study-flashcards'
import studyFlashcardsOptimized from './actions/study-flashcards-optimized'
import getPLvlStats from './actions/get-p-lvl-stats'
import getPLvlStatsByChapter from './actions/get-p-lvl-stats-by-chapter'
import getPLvlStatsByBox from './actions/get-p-lvl-stats-by-custom-box'
import getPLvlStatsByBook from './actions/get-p-lvl-stats-by-book'
import getPLvlStatsByCourse from './actions/get-p-lvl-stats-by-course'

import { schema as answerFlashcardSchema } from './validation/schema/answer-flashcard-schema'
import shuffleFlashcards from './actions/shuffle-flashcards'
import { customParam } from '@desmart/js-utils'

export default app => {
  app.get('/student-book-content-flashcards', authStudent, studentCourseContext, route(fetchAllFlashcards, [userId, query, studentCourse]))
  app.get('/student-book-content-flashcards/archived', authStudent, studentCourseContext, route(fetchAllArchivedFlashcards, [userId, query, studentCourse]))
  app.get('/student-book-content-flashcards/study', authStudent, studentCourseContext, route(studyFlashcards, [userId, query, studentCourse]))
  app.get('/student-book-content-flashcards/study-optimized', authStudent, studentCourseContext, route(studyFlashcardsOptimized, [userId, query, studentCourse]))
  app.get('/student-book-content-flashcards/p-lvl-stats', authStudent, studentCourseContext, route(getPLvlStats, [userId, query, studentCourse]))
  app.get('/student-book-content-flashcards/student-chapter/:chapter_id/p-lvl-stats', authStudent, studentCourseContext, route(getPLvlStatsByChapter, [customParam('chapter_id'), user, studentCourse]))
  app.get('/student-book-content-flashcards/box/:box_id/p-lvl-stats', authStudent, studentCourseContext, route(getPLvlStatsByBox, [customParam('box_id'), user, studentCourse]))
  app.get('/student-book-content-flashcards/student-book/:student_book_id/p-lvl-stats', authStudent, studentCourseContext, route(getPLvlStatsByBook, [customParam('student_book_id'), user, studentCourse]))
  app.get('/student-book-content-flashcards/student-course/p-lvl-stats', authStudent, studentCourseContext, route(getPLvlStatsByCourse, [user, studentCourse]))

  app.patch('/student-book-content-flashcards/reset', authRealStudent, studentCourseContext, route(resetFlashcards, [user, query, studentCourse]))
  app.patch('/student-book-content-flashcards/:id/answer', authRealStudent, studentCourseContext, route(answerFlashcard, [user, id, payloadValidate(answerFlashcardSchema), studentCourse]))

  app.post('/student-book-content-flashcards/shuffle', authStudent, studentCourseContext, route(shuffleFlashcards, [userId]))
}
