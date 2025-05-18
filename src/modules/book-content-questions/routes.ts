import { customParam, id, route } from '@desmart/js-utils'
import { authAdmin } from '../../middleware/authorize'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { BookContentQuestion } from '../../models'
import { bookPermissionByContentId, bookPermissionByRelatedItemId } from '../../middleware/book-permission'
import Actions from './actions'

export default app => {
  app.patch('/book-content-questions/:id/content/:content_id/reorder/:direction', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.assign_content_questions), route(Actions.reorderContentQuestions, [id, customParam('content_id'), customParam('direction')]))

  app.get('/book-content-questions/subchapter/:id', route(Actions.getBySubchapterId, [id]))
  app.get('/book-content-questions/:id', authAdmin, route(Actions.fetchContentQuestions, [id]))

  app.delete('/book-content-questions/:id', authAdmin, bookPermissionByRelatedItemId(BookContentQuestion, BookAdminPermissionsEnum.assign_content_questions), route(Actions.removeContentQuestion, [id]))
}
