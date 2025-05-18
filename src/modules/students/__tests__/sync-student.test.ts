import env from '../../../../utils/env'
import jwt from 'jsonwebtoken'
import syncStudent from '../actions/sync-student'
import { findOne, findOneOrFail } from '../student-repository'
import { issueAuthToken } from '../actions/helpers/simulate-sync-student'

describe('testing sync student', () => {
  it('should create a new student', async () => {
    const tokenPayload = {
      student_name: 'Test Student',
      student_email: 'bogdan+sync+student+1@desmart.com',
      student_phone: '123456789',
    }
    const token = issueAuthToken(tokenPayload)

    const request = {
      headers: {
        'x-proxy-authorization': token,
      },
      is_simulation: true,
    }

    await syncStudent(request)

    const student = await findOne({
      email: tokenPayload.student_email,
      name: tokenPayload.student_name,
      phone_number: tokenPayload.student_phone,
    })

    expect(student).toBeDefined()
  })

  it('should update an existing student', async () => {
    const tokenPayload = {
      student_name: 'Test Student',
      student_email: 'bogdan+sync+student+2@desmart.com',
      student_phone: '123456789',
    }
    const token = issueAuthToken(tokenPayload)

    const request = {
      headers: {
        'x-proxy-authorization': token,
      },
      is_simulation: true,
    }

    const { id: id1 } = await syncStudent(request)

    const tokenPayloadAfter = {
      student_name: 'Test Student 2',
      student_email: 'bogdan+sync+student+2@desmart.com',
      student_phone: '12345678910',
    }
    const tokenAfter = issueAuthToken(tokenPayloadAfter)

    const requestAfter = {
      headers: {
        'x-proxy-authorization': tokenAfter,
      },
      is_simulation: true,
    }

    const { id: id2 } = await syncStudent(requestAfter)

    expect(id1).toEqual(id2)

    await expect(findOneOrFail({
      id: id1,
      email: tokenPayload.student_email,
      name: tokenPayload.student_name,
      phone_number: tokenPayload.student_phone,
    })).rejects.toThrow()
    await expect(findOneOrFail({
      id: id1,
      email: tokenPayloadAfter.student_email,
      name: tokenPayloadAfter.student_name,
      phone_number: tokenPayloadAfter.student_phone,
    })).resolves.not.toThrow()
  })
})
