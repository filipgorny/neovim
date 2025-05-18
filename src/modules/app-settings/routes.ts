import { request, route, customParam, id, payloadValidate } from '@desmart/js-utils'
import { authMasterAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import fetchByNamespace from './actions/fetch-by-namespace'
import updateAppSetting from './actions/update-app-setting'

import { schema as updateConfigEntrySchema } from './validation/schema/update-config-entry-schema'
import updateGladiatorAppSetting from './actions/update-gladiator-app-setting'
import gladiatorFetchByNamespace from './actions/gladiator-fetch-by-namespace'

import fetchTimezone from './actions/fetch-timezone'

export default app => {
  app.patch('/app-settings/gladiators/:id', authMasterAdmin, route(updateGladiatorAppSetting, [id, request, payloadValidate(updateConfigEntrySchema)]))
  app.patch('/app-settings/:id', authMasterAdmin, route(updateAppSetting, [id, payloadValidate(updateConfigEntrySchema)]))

  app.get('/app-settings/namespace/:namespace', route(fetchByNamespace, [customParam('namespace')]))
  app.get('/app-settings/gladiators/namespace/:namespace', route(gladiatorFetchByNamespace, [request, customParam('namespace')]))

  app.get('/app-settings/timezone', authStudentOrAdmin, route(fetchTimezone))
}
