import * as R from 'ramda'
import env from '../../../../utils/env'
import adminLogIn from '../actions/admin-log-in'
import createAdmin from '../actions/create-admin'
import jwt from 'jsonwebtoken'

describe('testing admin log in', () => {
  it.skip('should log in admin', async () => {
    const payload = {
      email: 'bogdan+login1@desmart.com',
      password: '123qwe!',
      name: 'Bogdan Szczerbak',
    }

    await createAdmin(payload)

    const result = await adminLogIn(R.omit(['name'], payload))

    const tokenData = jwt.verify(result.token, env('APP_KEY'))

    expect(tokenData.email).toEqual(payload.email)
    expect(result.email).toEqual(payload.email)
    expect(new Date().getTime() - new Date(tokenData.createdAt).getTime()).toBeLessThan(1000) // less that a second
  })
})
