const ExamPassageTimeMetrics = bookshelf => bookshelf.model('ExamPassageTimeMetrics', {
  tableName: 'exam_passage_time_metrics',
  uuid: true,
})

export default ExamPassageTimeMetrics
