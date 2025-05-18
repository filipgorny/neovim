import { payloadValidate, query, user } from '@desmart/js-utils'
import { route, studentCourse } from '../../../utils/route/attach-route'
import { authRealStudent } from '../../middleware/authorize'
import Actions from './actions'
import { schema as createGameEntrySchema } from './validation/schema/create-game-entry-schema'
import { studentCourseContextOptional } from '../../middleware/student-course-context'

export default app => {
  app.post('/games/respiration', authRealStudent, studentCourseContextOptional, route(Actions.createGameEntry, [user, payloadValidate(createGameEntrySchema), studentCourse]))

  app.get('/games/respiration/personal-best', authRealStudent, route(Actions.getPersonalBest, [user, query]))
  app.get('/games/respiration/period-best', authRealStudent, route(Actions.getPeriodBest, [query]))
  app.get('/games/respiration/daily-best', authRealStudent, route(Actions.getDailyBest, [query]))
  app.get('/games/respiration/weekly-best', authRealStudent, route(Actions.getWeeklyBest, [query]))
  app.get('/games/respiration/monthly-best', authRealStudent, route(Actions.getMonthlyBest, [query]))
}
