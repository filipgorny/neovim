const parseJson = (value) => value ? JSON.parse(value) : null
import { FETCHED, FETCHED_COLLECTION, SAVED } from './model-events'

const CourseMap = bookshelf => bookshelf.model('CourseMap', {
  tableName: 'course_map',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      console.log(instance.get('metadata'))
      return instance.set({
        metadata: parseJson(instance.get('metadata')),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        metadata: parseJson(instance.get('metadata')),
      }))
    })

    this.on(SAVED, instance => {
      instance.set({
        metadata: parseJson(instance.get('metadata')),
      })
    })
  },

  course () {
    return this.belongsTo('Course', 'book_course_id')
  },
})

export default CourseMap
