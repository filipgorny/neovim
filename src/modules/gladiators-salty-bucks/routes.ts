import { route, id, payloadValidate } from '@desmart/js-utils'
import { schema } from './validation/gladiators-salty-bucks'
import { authApiClient } from '../../middleware/authorize-api-client'
import Actions from './actions'

export default app => {
  app.patch('/api/salty-bucks/add', authApiClient, route(Actions.addSaltyBucks, [payloadValidate(schema)]))
  app.patch('/api/salty-bucks/deduct', authApiClient, route(Actions.deductSaltyBucks, [payloadValidate(schema)]))
  app.get('/api/salty-bucks/:id', authApiClient, route(Actions.getSaltyBucks, [id]))
}
