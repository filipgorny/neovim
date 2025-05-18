import { customParam, id, payload, payloadValidate, query, route } from '../../../utils/route/attach-route'
import { allow, Role } from '../../middleware/authorize'
import getMap from './actions/get-map'
import createMapEntry from './actions/create-map-entry'
import fetchOne from './actions/fetch-one'
import updateMapEntry from './actions/update-map-entry'
import deleteOne from './actions/delete-one'
import getMapForStudent from './actions/get-map-for-student'

import { schema as createMapEntrySchema } from './validation/schema/create-map-entry-schema'
import { schema as updateMapEntrySchema } from './validation/schema/update-map-entry-schema'

export default app => {
  app.get('/course/:id/map', allow(Role.igor), route(getMap, [id, query]))
  app.post('/course/:id/map', allow(Role.igor), route(createMapEntry, [id, payloadValidate(createMapEntrySchema)]))
  app.get('/course/:id/student/:student_id/map/available', route(getMapForStudent, [id, customParam('student_id'), query]))
  app.get('/course/:id/map/:itemId', route(fetchOne, [id, customParam('itemId')]))
  app.patch('/course/:id/map/:itemId', allow(Role.igor), route(updateMapEntry, [id, customParam('itemId'), payloadValidate(updateMapEntrySchema)]))
  app.delete('/course/:id/map/:itemId', allow(Role.igor), route(deleteOne, [id, customParam('itemId')]))
}
