import env from '../../../../utils/env'
import adminLogIn from '../actions/admin-log-in'
import createAdmin from '../actions/create-admin'
import resetPasswordFinish from '../actions/reset-password-finish'
import resetPasswordInit from '../actions/reset-password-init'
import resetPasswordValidate from '../actions/reset-password-validate'
import { findOneOrFail } from '../admin-repository'
import jwt from 'jsonwebtoken'

describe('testing resetting password', () => {
  it.skip('should reset password', async () => {
    const payload = {
      email: 'bogdan+reset+password+1@gmail.com',
      password: '123qwe123qwe!',
      name: 'Bohdan Shcherbak',
    }

    await createAdmin(payload)

    const {
      id,
    } = await resetPasswordInit({ email: payload.email })

    const {
      password_reset_token,
      password_reset_token_created_at,
    } = await findOneOrFail({ id })

    expect(password_reset_token).toBeDefined()
    expect(password_reset_token_created_at).toBeDefined()
    expect(new Date().getTime() - new Date(password_reset_token_created_at).getTime()).toBeLessThan(1000)

    const { isValid } = await resetPasswordValidate({ id, token: password_reset_token })

    expect(isValid).toBeTruthy()

    const newPassword = 'qwe123!'

    await resetPasswordFinish({ id, token: password_reset_token, password: newPassword })

    const result = await adminLogIn({
      email: payload.email,
      password: newPassword,
    })

    const tokenData = jwt.verify(result.token, env('APP_KEY'))

    expect(tokenData.email).toEqual(payload.email)
  })
})
