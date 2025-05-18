import * as R from 'ramda'
import { FETCHED_COLLECTION, FETCHED } from './model-events'

const hideSensitiveData = instance => instance.set({
  password: null,
})

const OrganizationAdmin = bookshelf => bookshelf.model('OrganizationAdmin', {
  tableName: 'organization_admins',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED_COLLECTION, collection => {
      R.map(hideSensitiveData)(collection)
    })

    this.on(FETCHED, instance => {
      return hideSensitiveData(instance)
    })
  },

  organization () {
    return this.belongsTo('Organization', 'organization_id')
  },
})

export default OrganizationAdmin
