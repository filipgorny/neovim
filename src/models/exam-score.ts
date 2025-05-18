const ExamScore = bookshelf => bookshelf.model('ExamScore', {
  tableName: 'exam_scores',
  uuid: true,
})

export default ExamScore
