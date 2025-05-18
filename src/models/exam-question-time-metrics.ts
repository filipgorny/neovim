const ExamQuestionTimeMetrics = bookshelf => bookshelf.model('ExamQuestionTimeMetrics', {
  tableName: 'exam_question_time_metrics',
  uuid: true,
})

export default ExamQuestionTimeMetrics
