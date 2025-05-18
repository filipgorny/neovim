const ExamErrata = bookshelf => bookshelf.model('ExamErrata', {
  tableName: 'exam_erratas',
  uuid: true,
})

export default ExamErrata
