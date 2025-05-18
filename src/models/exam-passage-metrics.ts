const ExamPassageMetrics = bookshelf => bookshelf.model('ExamPassageMetrics', {
  tableName: 'exam_passage_metrics',
  uuid: true
})

export default ExamPassageMetrics
