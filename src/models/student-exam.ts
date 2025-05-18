import { FETCHED, FETCHED_COLLECTION, SAVED } from './model-events'

const parseJson = (value) => value ? JSON.parse(value) : null

const StudentExam = bookshelf => bookshelf.model('StudentExam', {
  tableName: 'student_exams',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        exam_length: parseJson(instance.get('exam_length')),
        break_definition: parseJson(instance.get('break_definition')),
        scores: parseJson(instance.get('scores')),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        exam_length: parseJson(instance.get('exam_length')),
        break_definition: parseJson(instance.get('break_definition')),
        scores: parseJson(instance.get('scores')),
      }))
    })

    this.on(SAVED, instance => {
      instance.set({
        exam_length: parseJson(instance.get('exam_length')),
        break_definition: parseJson(instance.get('break_definition')),
        scores: parseJson(instance.get('scores')),
      })
    })
  },

  layout () {
    return this.belongsTo('Layout', 'layout_id')
  },

  type () {
    return this.belongsTo('ExamType', 'exam_type_id')
  },

  sections () {
    return this.hasMany('StudentExamSection', 'student_exam_id', 'id')
  },

  originalExam () {
    return this.belongsTo('Exam', 'exam_id')
  },

  student () {
    return this.belongsTo('Student', 'student_id')
  },
})

export default StudentExam
