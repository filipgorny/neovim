import { route, payloadValidate, query, id, customParam } from '@desmart/js-utils'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/custom-event-types', authAdmin, route(Actions.createCustomEventType, [payloadValidate(Validation.createCustomEventType)]))

  app.get('/custom-event-types', authStudentOrAdmin, route(Actions.fetchAllCustomEventTypes, [query]))
  app.get('/custom-event-types/:id', authStudentOrAdmin, route(Actions.fetchCustomEventType, [id]))

  app.patch('/custom-event-types/:id', authAdmin, route(Actions.updateCustomEventType, [id, payloadValidate(Validation.updateCustomEventType)]))
  app.patch('/custom-event-types/:custom_event_group_id/type/:id/reorder/:direction', authAdmin, route(Actions.reorderCustomEventType, [customParam('custom_event_group_id'), id, customParam('direction')]))

  app.delete('/custom-event-types/:id', authAdmin, route(Actions.deleteCustomEventType, [id]))
}
