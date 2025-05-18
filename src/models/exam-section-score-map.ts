const ExamSectionScoreMap = bookshelf => bookshelf.model('ExamSectionScoreMap', {
  tableName: 'exam_section_score_map',
  uuid: true,
})

export default ExamSectionScoreMap
