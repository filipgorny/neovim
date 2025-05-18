import { customParam, payloadValidate } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import Actions from './actions'
import Validation from './validation/schema'
import { authMasterAdmin } from '../../middleware/authorize'

export default app => {
  app.post('/socket-servers/student/:student_id/send-notification', authMasterAdmin, route(Actions.sendNotificationToStudent, [customParam('student_id')]))
  app.post('/socket-servers/students/bulk-send-notification', authMasterAdmin, route(Actions.sendNotificationToStudents, [payloadValidate(Validation.sendNotificationToStudentsSchema)]))
  app.post('/socket-servers/students/all/send-notification', authMasterAdmin, route(Actions.sendNotificationToAllStudents))
}
