import createAdmin from '../actions/create-admin'
import deleteAdmin from '../actions/delete-admin'
import { findOneOrFail } from '../admin-repository'
import { createMasterAdmin } from '../admin-service'

describe('testing deleting admin', () => {
  it.skip('should fail to delete admin by himself', async () => {
    const payload = {
      email: 'bogdan+2@gmail.com',
      password: '123qwe!',
      name: 'Bohdan Shcherbak',
    }

    const admin = await createAdmin(payload)

    await expect(deleteAdmin(admin.id, admin)).rejects.toThrow()
  })

  it.skip('should delete admin by master admin', async () => {
    const masterAdmin = await createMasterAdmin('bogdan+777@desmart.com', '123qwe123qwe!')

    const payload = {
      email: 'bogdan+3@gmail.com',
      password: '123qwe!',
      name: 'Bohdan Shcherbak',
    }

    const admin = await createAdmin(payload)

    await expect(deleteAdmin(admin.id, masterAdmin)).resolves.not.toThrow()
  })

  it.skip('should delete admin by not master admin', async () => {
    const payload1 = {
      email: 'bogdan+4@gmail.com',
      password: '123qwe!',
      name: 'Bohdan Shcherbak',
    }

    const admin1 = await createAdmin(payload1)

    const payload2 = {
      email: 'bogdan+5@gmail.com',
      password: '123qwe!',
      name: 'Bohdan Shcherbak',
    }

    const admin2 = await createAdmin(payload2)

    await expect(deleteAdmin(admin1.id, admin2)).resolves.not.toThrow()
    await expect(findOneOrFail({ email: payload1.email })).rejects.toThrow()
  })
})
