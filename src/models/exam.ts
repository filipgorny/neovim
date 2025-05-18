import { DELETED_AT } from '../../utils/generics/repository'

const Exam = bookshelf => bookshelf.model('Exam', {
  tableName: 'exams',
  uuid: true,

  sections () {
    return this.hasMany('ExamSection', 'exam_id', 'id')
  },

  type () {
    return this.belongsTo('ExamType', 'exam_type_id')
  },

  scores () {
    return this.hasMany('ExamScore', 'exam_id', 'id')
  },

  completedStudentExams () {
    return this.hasMany('StudentExam', 'exam_id', 'id')
      .query(qb => qb
        .where({ [DELETED_AT]: null })
        .whereNotNull('completed_at')
      )
  },
})

export default Exam
