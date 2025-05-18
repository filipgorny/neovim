const ScaledScoreTemplate = bookshelf => bookshelf.model('ScaledScoreTemplate', {
  tableName: 'scaled_score_templates',
  uuid: true,

  scores () {
    return this.hasMany('ScaledScore', 'template_id', 'id')
  },
})

export default ScaledScoreTemplate
