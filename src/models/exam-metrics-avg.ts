const ExamMetricsAvg = bookshelf => bookshelf.model('ExamMetricsAvg', {
  tableName: 'exam_metrics_avg',
  uuid: true
})

export default ExamMetricsAvg
