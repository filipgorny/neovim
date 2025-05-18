import { id, payloadValidate, query, route, request, user } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import createQuestion from './actions/create-question'
import updateQuestion from './actions/update-question'
import deleteQuestion from './actions/delete-question'
import getQuestion from './actions/get-question'
import listQuestions from './actions/list-questions'
import bulkDeleteQuestions, { Payload as BulkDeletePayload } from './actions/bulk-delete-questions'

import { schema as createQuestionSchema } from './validation/schema/create-question'
import { schema as updateQuestionSchema } from './validation/schema/update-question'
import { schema as bulkDeleteQuestionsSchema } from './validation/schema/bulk-delete-questions'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { looseBookOrGlobalPermission, onlyAssignedQuestions } from '../../middleware/book-permission'
import { GlobalPerms } from '../admins/admin-global-permissions'

export default app => {
  app.post('/questions', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_content_questions, GlobalPerms.C), route(createQuestion, [request, user, payloadValidate(createQuestionSchema)]))

  app.patch('/questions/bulk-delete', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_content_questions, GlobalPerms.C), onlyAssignedQuestions, route(bulkDeleteQuestions, [request, payloadValidate<BulkDeletePayload>(bulkDeleteQuestionsSchema), query]))
  app.patch('/questions/:id', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_content_questions, GlobalPerms.C), onlyAssignedQuestions, route(updateQuestion, [request, id, payloadValidate(updateQuestionSchema)]))

  app.get('/questions', authAdmin, route(listQuestions, [query]))
  app.get('/questions/:id', authAdmin, route(getQuestion, [id]))

  app.delete('/questions/:id', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_content_questions, GlobalPerms.C), onlyAssignedQuestions, route(deleteQuestion, [request, id, query]))
}
