import { payloadValidate, user, query } from '@desmart/js-utils'
import { route, studentCourse } from '../../../utils/route/attach-route'
import { authRealStudent } from '../../middleware/authorize'
import createGameEntry from './actions/create-game-entry'
import getPersonalBest from './actions/get-personal-best'
import getPeriodBest from './actions/get-period-best'
import getDailyBest from './actions/get-daily-best'
import getWeeklyBest from './actions/get-weekly-best'
import getMonthlyBest from './actions/get-monthly-best'

import { schema as createGameEntrySchema } from './validation/schema/create-game-entry-schema'
import { studentCourseContextOptional } from '../../middleware/student-course-context'

export default app => {
  app.post('/games/amino-acid', authRealStudent, studentCourseContextOptional, route(createGameEntry, [user, payloadValidate(createGameEntrySchema), studentCourse]))

  app.get('/games/amino-acid/personal-best', authRealStudent, route(getPersonalBest, [user, query]))
  app.get('/games/amino-acid/period-best', authRealStudent, route(getPeriodBest, [query]))
  app.get('/games/amino-acid/daily-best', authRealStudent, route(getDailyBest, [query]))
  app.get('/games/amino-acid/weekly-best', authRealStudent, route(getWeeklyBest, [query]))
  app.get('/games/amino-acid/monthly-best', authRealStudent, route(getMonthlyBest, [query]))
}
