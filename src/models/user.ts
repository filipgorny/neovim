import R from 'ramda'
import { CREATING, CREATED, FETCHED_COLLECTION, FETCHED } from './model-events'
import hashString from '../../utils/hashing/hash-string'

const hideSensitiveData = instance => instance.set({
  password: null,
  email_verification_token: null,
  is_email_verified: null,
  password_reset_token: null,
  password_reset_token_created_at: null,
})

const User = bookshelf => bookshelf.model('User', {
  tableName: 'users',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(CREATING, instance => {
      instance.set({
        password: hashString(instance.get('password')),
      })
    })

    this.on(CREATED, async instance => {
      hideSensitiveData(instance)
    })

    this.on(FETCHED_COLLECTION, collection => {
      R.map(hideSensitiveData)(collection)
    })
  },

  student () {
    return this.belongsTo('Student', 'email', 'email')
  },
})

export default User
