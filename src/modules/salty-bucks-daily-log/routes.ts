import { query, user } from '@desmart/js-utils'
import { route, studentCourse } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import Actions from './actions'

export default app => {
  app.get('/leaderboard', authStudent, route(Actions.getLeaderBoard, [query]))
  app.get('/leaderboard/salty-bucks-categories-chart', authStudent, route(Actions.getSaltyBucksCategoriesChart, [user]))
  app.get('/leaderboard/percentile-rank', authStudent, studentCourseContext, route(Actions.getPercentileRank, [user, studentCourse]))
}
