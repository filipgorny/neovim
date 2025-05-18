import { route, payloadValidate, query, id } from '@desmart/js-utils'
import Actions from './actions'
import Validation from './validation/schema'
import { authMasterAdmin } from '../../middleware/authorize'

export default app => {
  app.post('/organizations', authMasterAdmin, route(Actions.createOrganization, [payloadValidate(Validation.createOrganization)]))

  app.get('/organizations', authMasterAdmin, route(Actions.fetchAllOrganizations, [query]))
  app.get('/organizations/:id', authMasterAdmin, route(Actions.fetchOneOrganization, [id]))

  app.patch('/organizations/:id', authMasterAdmin, route(Actions.updateOrganization, [id, payloadValidate(Validation.updateOrganization)]))

  app.delete('/organizations/:id', authMasterAdmin, route(Actions.deleteOrganization, [id]))
}
