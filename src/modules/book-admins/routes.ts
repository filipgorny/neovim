import { route } from '../../../utils/route/attach-route'
import deleteOne from './actions/delete-one'
import Actions from './actions'
import Validation from './validation/schema'
import { authMasterAdmin } from '../../middleware/authorize'
import { id, payloadValidate } from '@desmart/js-utils'

export default app => {
  app.post('/book-admins', authMasterAdmin, route(Actions.createBookAdmin, [payloadValidate(Validation.createBookAdmin)]))
  app.delete('/book-admins/:id', authMasterAdmin, route(deleteOne, [id]))
}
