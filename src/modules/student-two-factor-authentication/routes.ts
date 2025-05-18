import { payloadValidate, request, route } from '../../../utils/route/attach-route'
import { authAdmin, authMasterAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import resendAsAdmin from './actions/resend-as-admin'
import { id, query } from '@desmart/js-utils'

export default app => {
  app.post('/student-two-factor-authentication/verify-student', route(Actions.verifyPhoneNumberAndEmail, [payloadValidate(Validation.verifyPhoneNumberAndEmailSchema)]))
  app.post('/student-two-factor-authentication/send-code', route(Actions.sendCode, [request, query]))
  app.post('/student-two-factor-authentication/verify-code', route(Actions.verifyCode, [request, payloadValidate(Validation.verifyCodeSchema)]))
  app.post('/student-two-factor-authentication/enable', authMasterAdmin, route(Actions.enable))
  app.post('/student-two-factor-authentication/disable', authMasterAdmin, route(Actions.disable))
  app.post('/student-two-factor-authentication/:id/resend', authAdmin, route(resendAsAdmin, [id]))
  app.post('/student-two-factor-authentication/toggle-email-resend', authMasterAdmin, route(Actions.toggleEmailResend))

  app.get('/student-two-factor-authentication/is-enabled', route(Actions.isEnabled))
}
