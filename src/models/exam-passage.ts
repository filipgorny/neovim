import { FETCHED, FETCHED_COLLECTION, SAVED } from './model-events'

const ExamPassage = bookshelf => bookshelf.model('ExamPassage', {
  tableName: 'exam_passages',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        reading_avg: parseInt(instance.get('reading_avg'), 10),
        working_avg: parseInt(instance.get('working_avg'), 10),
        checking_avg: parseInt(instance.get('checking_avg'), 10),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        reading_avg: parseInt(instance.get('reading_avg'), 10),
        working_avg: parseInt(instance.get('working_avg'), 10),
        checking_avg: parseInt(instance.get('checking_avg'), 10),
      }))
    })
  },

  questions () {
    return this.hasMany('ExamQuestion', 'passage_id', 'id')
  },
})

export default ExamPassage
