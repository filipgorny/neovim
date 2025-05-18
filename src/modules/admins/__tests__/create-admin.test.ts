import compareHashes from '../../../../utils/hashing/compare-hashes'
import createAdmin from '../actions/create-admin'
import { findOneOrFail } from '../admin-repository'

describe('testing creating admin', () => {
  it.skip('should create admin', async () => {
    const payload = {
      email: 'b.szczerbak@gmail.com',
      password: '123qwe!',
      name: 'Bogdan Szczerbak',
    }

    let result = await createAdmin(payload)

    result = result.toJSON()

    expect(result.email).toEqual(payload.email)
    expect(result.name).toEqual(payload.name)
    expect(compareHashes(payload.password, result.password)).toEqual(true)
  })

  it.skip('should create admin and check if it is in the db', async () => {
    const payload = {
      email: 'bogdan+1@gmail.com',
      password: '123qwe!',
      name: 'Bohdan Shcherbak',
    }

    await createAdmin(payload)

    const admin = await findOneOrFail({ email: payload.email })

    expect(admin.email).toEqual(payload.email)
    expect(admin.name).toEqual(payload.name)
    expect(admin.password).toEqual(null)
  })

  it.skip('should throw error when email is invalid', async () => {
    const payload = {
      email: 'bogdan+.com',
      password: '123qwe!',
      name: 'Bohdan Shcherbak',
    }

    await expect(createAdmin(payload)).rejects.toThrow()
  })
})
