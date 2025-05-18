import * as R from 'ramda'
import createAdmin from '../actions/create-admin'
import fetchAllAdmins from '../actions/fetch-all-admins'

describe('testing fetching all admins', () => {
  it.skip('should fetch all admins', async () => {
    await createAdmin({
      email: 'bogdan+all+admins+1@desmart.com',
      password: '123qwe!',
      name: 'Adminissimo1',
    })

    await createAdmin({
      email: 'bogdan+all+admins+2@desmart.com',
      password: '123qwe!',
      name: 'Adminissimo2',
    })

    const query = {
      limit: { page: 1, take: 10 },
      order: { by: 'created_at', dir: 'asc' },
      filter: {
        search: 'dminiss',
      },
    }
    const admins = await fetchAllAdmins(query)

    console.log(admins)

    expect(admins.data).toHaveLength(2)
    expect(R.pluck('name')(admins.data)).toEqual(['Adminissimo1', 'Adminissimo2'])
    expect(admins.meta.recordsTotal).toEqual('2')
    expect(admins.meta.pagesTotal).toEqual(1)
  })

  it.skip('should fetch the admin', async () => {
    await createAdmin({
      email: 'bogdan+all+admins+3@desmart.com',
      password: '123qwe!',
      name: 'Adminissimo1',
    })

    await createAdmin({
      email: 'bogdan+all+admins+4@desmart.com',
      password: '123qwe!',
      name: 'Adminissimo2',
    })

    const query = {
      limit: { page: 1, take: 10 },
      order: { by: 'created_at', dir: 'asc' },
      filter: {
        email: 'bogdan+all+admins+4@desmart.com',
      },
    }
    const admins = await fetchAllAdmins(query)

    console.log(admins)

    expect(admins.data).toHaveLength(1)
    expect(R.pluck('name')(admins.data)).toEqual(['Adminissimo2'])
    expect(admins.meta.recordsTotal).toEqual('1')
    expect(admins.meta.pagesTotal).toEqual(1)
  })
})
