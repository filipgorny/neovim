const ExamScoreMap = bookshelf => bookshelf.model('ExamScoreMap', {
  tableName: 'exam_score_map',
  uuid: true,
})

export default ExamScoreMap
