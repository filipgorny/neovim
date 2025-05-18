const ExamMetrics = bookshelf => bookshelf.model('ExamMetrics', {
  tableName: 'exam_metrics',
  uuid: true
})

export default ExamMetrics
