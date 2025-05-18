import { route, payload, payloadValidate } from '../../../utils/route/attach-route'
import { allow, authAdmin, Role } from '../../middleware/authorize'
import saveSettings from './actions/save-settings'
import getSettings from './actions/get-settings'

import { schema as saveSettingsSchema } from './validation/settings-schema'

export default app => {
  app.patch('/settings/save', allow(Role.igor), route(saveSettings, [payloadValidate(saveSettingsSchema)]))
  app.get('/settings', authAdmin, route(getSettings))
}
