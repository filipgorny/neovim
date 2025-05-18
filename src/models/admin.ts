import * as R from 'ramda'
import { FETCHED_COLLECTION, FETCHED } from './model-events'

const hideSensitiveData = instance => instance.set({
  password: null,
})

const Admin = bookshelf => bookshelf.model('Admin', {
  tableName: 'admins',
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

  chapters () {
    return this.hasMany('BookChapter', 'chapter_id')
      .through('ChapterAdmin', 'id', 'admin_id', 'chapter_id')
  },

  bookAdminPermissions () {
    return this.hasMany('BookAdmin', 'admin_id')
  },

  adminCourses () {
    return this.hasMany('AdminCourse', 'admin_id')
  },
})

export default Admin
