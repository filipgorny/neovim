import { customParam, id, query, route, user } from '@desmart/js-utils'
import { studentCourse } from '../../../utils/route/attach-route'
import { authMasterAdmin, authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import bookProgress from './actions/book-progress'
import contentQuestionProgress from './actions/content-question-progress'
import flashcardProficiency from './actions/flashcard-proficiency'
import mostRecentMcatScores from './actions/most-recent-mcat-scores'
import saltyBucksEarnings from './actions/salty-bucks-earnings'
import studyTime from './actions/study-time'
import getCompletionMeter from './actions/get-completion-meter'
import debugCompletionMeter from './actions/debug-completion-meter'
import getChecklistHeatmap from './actions/get-checklist-heatmap'
import getGameRanks from './actions/get-game-ranks'
import videoProgress from './actions/video-progress'

export default app => {
  app.get('/dashboard/graphs/book-progress', authStudent, studentCourseContext, route(bookProgress, [user, studentCourse]))
  app.get('/dashboard/graphs/content-question-progress', authStudent, studentCourseContext, route(contentQuestionProgress, [user, studentCourse]))
  app.get('/dashboard/graphs/study-time', authStudent, studentCourseContext, route(studyTime, [user, studentCourse]))
  app.get('/dashboard/graphs/salty-bucks/:mode', authStudent, route(saltyBucksEarnings, [user, query, customParam('mode')]))
  app.get('/dashboard/graphs/mcat', authStudent, studentCourseContext, route(mostRecentMcatScores, [user, studentCourse]))
  app.get('/dashboard/graphs/flashcard-proficiency', authStudent, studentCourseContext, route(flashcardProficiency, [user, studentCourse]))
  app.get('/dashboard/graphs/checklist-heatmap', authStudent, studentCourseContext, route(getChecklistHeatmap, [user, studentCourse]))
  app.get('/dashboard/graphs/video-progress', authStudent, studentCourseContext, route(videoProgress, [user, studentCourse]))
  app.get('/dashboard/completion-meter', authStudent, studentCourseContext, route(getCompletionMeter, [user, studentCourse]))
  app.get('/dashboard/completion-meter/:student_course_id/debug', authMasterAdmin, route(debugCompletionMeter, [customParam('student_course_id')]))
  app.get('/dashboard/games/ranks', authStudent, studentCourseContext, route(getGameRanks, [user, studentCourse]))
}
