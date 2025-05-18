import jwt from 'jsonwebtoken'
import env from '../../../../utils/env'
import { findOneOrFail } from '../student-repository'
import refreshToken from '../actions/refresh-token'
import { simulateSyncStudent } from '../actions/helpers/simulate-sync-student'

describe('testing refresh token', () => {
  it('should refresh token', async () => {
    const email = 'bogdan+refresh+token+1@desmart.com'
    const name = 'This is name'
    const phone_number = '098294875619'
    const { token } = await simulateSyncStudent(email, name, phone_number)
    const student = await findOneOrFail({ email })
    const semiStudent = {
      ...student,
      toJSON () {
        return student
      },
    }

    const { token: tokenAfter } = await refreshToken(semiStudent, undefined, undefined)

    const tokenData = jwt.verify(token, env('APP_KEY'))
    const tokenAfterData = jwt.verify(tokenAfter, env('APP_KEY'))

    expect(tokenData).toEqual({
      ...tokenAfterData,
      createdAt: expect.any(String),
    })
  })
})
