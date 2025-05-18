import { customParam, route, user, files, query, id, payloadValidate } from '../../../utils/route/attach-route'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'
import { authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.get('/exam-types', authStudentOrAdmin, route(Actions.fetchAllExamTypes, [query]))
  app.get('/exam-types/dictionary', authStudentOrAdmin, route(Actions.fetchExamTypesDictionary, [user]))
  app.get('/exam-types/dictionary/:type', authStudentOrAdmin, route(Actions.fetchExamSubtypesDictionary, [customParam('type'), user]))
  app.get('/exam-types/labels', route(Actions.getTypeLabels))
  app.get('/exam-types/:id', authStudentOrAdmin, route(Actions.getExamType, [id]))

  app.post('/exam-types', permCheck(GlobalPerms.E), route(Actions.createExamType, [payloadValidate(Validation.createExamType)]))
  app.post('/exam-types/preview-exam-scaled-score-template', permCheck(GlobalPerms.E), route(Actions.previewExamScaledScoreTemplate, [files]))

  app.delete('/exam-types/:id', permCheck(GlobalPerms.E), route(Actions.deleteExamType, [id]))

  app.patch('/exam-types/:id', permCheck(GlobalPerms.E), route(Actions.updateExamType, [id, payloadValidate(Validation.updateExamType)]))
}
