import { route, payloadValidate, query } from '@desmart/js-utils'
import Validation from './validation/schema'
import Actions from './actions'
import { studentCourseContext } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'

export default app => {
  app.post('/ai-tutor-scores', authStudent, studentCourseContext, route(Actions.createAiTutorScore, [studentCourse, payloadValidate(Validation.createAiTutorScore)]))

  app.get('/ai-tutor-scores', authStudent, studentCourseContext, route(Actions.fetchAllAiTutorScores, [studentCourse, query]))
  app.get('/ai-tutor-scores/average', authStudent, studentCourseContext, route(Actions.fetchAllAverage, [studentCourse]))
  app.get('/ai-tutor-scores/chapter-progress', authStudent, studentCourseContext, route(Actions.fetchChapterProgress, [studentCourse]))
}
