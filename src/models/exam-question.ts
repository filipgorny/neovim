import { FETCHED, FETCHED_COLLECTION } from './model-events'

const parseJson = (value) => value ? JSON.parse(value) : null

const ExamQuestion = bookshelf => bookshelf.model('ExamQuestion', {
  tableName: 'exam_questions',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        answer_distribution: parseJson(instance.get('answer_distribution')),
        reading_avg: parseInt(instance.get('reading_avg'), 10),
        working_avg: parseInt(instance.get('working_avg'), 10),
        checking_avg: parseInt(instance.get('checking_avg'), 10),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        answer_distribution: parseJson(instance.get('answer_distribution')),
        reading_avg: parseInt(instance.get('reading_avg'), 10),
        working_avg: parseInt(instance.get('working_avg'), 10),
        checking_avg: parseInt(instance.get('checking_avg'), 10),
      }))
    })
  },

  passage () {
    return this.belongsTo('ExamPassage', 'passage_id')
  },
})

export default ExamQuestion
