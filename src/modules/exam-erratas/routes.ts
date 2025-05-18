import { id, payloadValidate, query, route, user } from '@desmart/js-utils'
import { authAdmin, authStudent } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/exam-erratas', authAdmin, route(Actions.createExamErrata, [user, payloadValidate(Validation.createExamErrata)]))

  app.get('/exam-erratas/exam/:id', route(Actions.fetchExamErratas, [id, query]))
  app.get('/exam-erratas', authStudent, route(Actions.fetchAllExamErratas, [user, query]))
  app.get('/exam-erratas/admin', authAdmin, route(Actions.fetchAllExamErratasByAdmin, [query]))

  app.patch('/exam-erratas/:id', authAdmin, route(Actions.updateExamErrata, [id, payloadValidate(Validation.updateExamErrata)]))

  app.delete('/exam-erratas/:id', authAdmin, route(Actions.deleteExamErrata, [id]))
}
