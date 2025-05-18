const ExamType = bookshelf => bookshelf.model('ExamType', {
  tableName: 'exam_types',
  uuid: true,

  scaledScoreDefinitions () {
    return this.hasMany('ExamTypeScaledScoreTemplate', 'exam_type_id', 'id')
  },

  introPages () {
    return this.hasMany('ExamIntroPage', 'exam_type_id', 'id')
  },
})

export default ExamType
