const ExamTypeScaledScoreTemplate = bookshelf => bookshelf.model('ExamTypeScaledScoreTemplate', {
  tableName: 'exam_type_scaled_score_templates',
  uuid: true,

  examType () {
    return this.belongsTo('ExamType', 'exam_type_id')
  },

  template () {
    return this.belongsTo('ScaledScoreTemplate', 'template_id', 'id')
  },
})

export default ExamTypeScaledScoreTemplate
