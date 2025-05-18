import { FETCHED, FETCHED_COLLECTION, SAVED } from './model-events'

const parseJson = (value) => value ? JSON.parse(value) : null

const StudentExamQuestion = bookshelf => bookshelf.model('StudentExamQuestion', {
  tableName: 'student_exam_questions',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        answer_definition: parseJson(instance.get('answer_definition')),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        answer_definition: parseJson(instance.get('answer_definition')),
      }))
    })

    this.on(SAVED, instance => {
      instance.set({
        answer_definition: parseJson(instance.get('answer_definition')),
      })
    })
  },

  passage () {
    return this.belongsTo('StudentExamPassage', 'student_passage_id')
  },

  originalQuestion () {
    return this.belongsTo('ExamQuestion', 'original_exam_question_id')
  },
})

export default StudentExamQuestion
