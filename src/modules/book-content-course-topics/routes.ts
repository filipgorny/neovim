import { customParam, id, payloadValidate, route } from '@desmart/js-utils'
import { authAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { looseBookOrGlobalPermission } from '../../middleware/book-permission'

export default app => {
  app.post('/content-topics/:book_content_id/course-topic/:course_topic_id', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_course_topics, GlobalPerms.R), route(Actions.createContentTopic, [customParam('book_content_id'), customParam('course_topic_id')]))

  app.get('/content-topics/course/:course_id/book-content/:book_content_id', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_course_topics, GlobalPerms.R), route(Actions.fetchAllByBookContent, [customParam('course_id'), customParam('book_content_id')]))

  app.delete('/content-topics/:id', authAdmin, route(Actions.deleteContentTopic, [id]))
  app.delete('/content-topics/course/:course_id/book-content/:book_content_id', authAdmin, route(Actions.deleteAllByBookContent, [customParam('course_id'), customParam('book_content_id')]))

  app.patch('/content-topics/:id/comment', authAdmin, route(Actions.addComment, [id, payloadValidate(Validation.addComment)]))
}
