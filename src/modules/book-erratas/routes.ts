import { id, payloadValidate, query, route, user } from '@desmart/js-utils'
import { authAdmin, authStudent } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/book-erratas', authAdmin, route(Actions.createErrata, [user, payloadValidate(Validation.createBookErrata)]))

  app.get('/book-erratas/book/:id', authStudent, route(Actions.fetchErratasByBook, [user, id, query]))
  app.get('/book-erratas/book-admin/:id', authAdmin, route(Actions.fetchErratasByBookAsAdmin, [id, query]))

  app.patch('/book-erratas/:id', authAdmin, route(Actions.updateErrata, [id, payloadValidate(Validation.updateBookErrata)]))

  app.delete('/book-erratas/:id', authAdmin, route(Actions.deleteErrata, [id]))
}
