import { customParam, payloadValidate } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import { authAdmin, authMasterAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.patch('/calendar-settings/:course_id', authMasterAdmin, route(Actions.updateCalendarSettings, [customParam('course_id'), payloadValidate(Validation.updateCalendarSettings)]))

  app.get('/calendar-settings/:course_id', authAdmin, route(Actions.fetchCalendarSettings, [customParam('course_id')]))
}
