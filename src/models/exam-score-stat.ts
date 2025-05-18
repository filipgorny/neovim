const ExamScoreStat = bookshelf => bookshelf.model('ExamScoreStat', {
  tableName: 'exam_score_stats',
  uuid: true,
})

export default ExamScoreStat
