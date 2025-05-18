import { customParam, payloadValidate, route } from '@desmart/js-utils'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/book-content-comments/course/:course_id/book-content/:book_content_id', route(Actions.upsertBookContentComment, [customParam('course_id'), customParam('book_content_id'), payloadValidate(Validation.upsertCommentSchema)]))

  app.get('/book-content-comments/course/:course_id/book-content/:book_content_id', route(Actions.fetchBookContentComments, [customParam('course_id'), customParam('book_content_id')]))
}
