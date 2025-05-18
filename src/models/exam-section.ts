const ExamSection = bookshelf => bookshelf.model('ExamSection', {
  tableName: 'exam_sections',
  uuid: true,

  passages () {
    return this.hasMany('ExamPassage', 'section_id', 'id')
  },

  scores () {
    return this.hasMany('ExamSectionScore', 'section_id', 'id')
  },

  scoreMap () {
    return this.hasMany('ExamSectionScoreMap', 'section_id', 'id')
  },

  exam () {
    return this.belongsTo('Exam', 'exam_id')
  },
})

export default ExamSection
