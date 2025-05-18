import { FETCHED, FETCHED_COLLECTION, SAVED } from './model-events'

const Notification = bookshelf => bookshelf.model('Notification', {
  tableName: 'notifications',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        student_groups: JSON.parse(instance.get('student_groups')),
        recurring_definition: JSON.parse(instance.get('recurring_definition')),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        student_groups: JSON.parse(instance.get('student_groups')),
        recurring_definition: JSON.parse(instance.get('recurring_definition')),
      }))
    })

    this.on(SAVED, instance => {
      instance.set({
        student_groups: JSON.parse(instance.get('student_groups')),
        recurring_definition: JSON.parse(instance.get('recurring_definition')),
      })
    })
  },
})

export default Notification
