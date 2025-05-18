import * as R from 'ramda'
import { queryValidate, route, studentCourse, userId } from '../../../utils/route/attach-route'
import { Router } from 'express'
import Actions from './actions'
import Validation from './validation/schema'
import { payloadValidate, query } from '@desmart/js-utils'
import { authRealStudent, authStudentOrAdmin } from '../../middleware/authorize'
import { studentCourseContextOptional } from '../../middleware/student-course-context'

export default (app: Router): void => {
  app.post('/hangman-games', authRealStudent, studentCourseContextOptional, route(Actions.createHangmanGame, [payloadValidate(Validation.createHangmanGameSchema), userId, studentCourse]))

  app.get('/hangman-games', authStudentOrAdmin, route(Actions.fetchHangmanGames, [query, R.path(['query', 'period'])]))
}
