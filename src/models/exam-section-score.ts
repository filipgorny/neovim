const ExamSectionScore = bookshelf => bookshelf.model('ExamSectionScore', {
  tableName: 'exam_section_scores',
  uuid: true,
})

export default ExamSectionScore
