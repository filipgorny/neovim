import { route, payloadValidate, query, id } from '@desmart/js-utils'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/mcat-dates', authAdmin, route(Actions.createMcatDate, [payloadValidate(Validation.createMcatDate)]))

  app.get('/mcat-dates', authStudentOrAdmin, route(Actions.fetchAllMcatDates, [query]))
  app.get('/mcat-dates/:id', authStudentOrAdmin, route(Actions.fetchOneMcatDate, [id]))

  app.patch('/mcat-dates/:id', authAdmin, route(Actions.updateMcatDate, [id, payloadValidate(Validation.updateMcatDate)]))

  app.delete('/mcat-dates/:id', authAdmin, route(Actions.deleteMcatDate, [id]))
}
