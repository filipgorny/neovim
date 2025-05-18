const ExamIntroPage = bookshelf => bookshelf.model('ExamIntroPage', {
  tableName: 'exam_intro_pages',
  uuid: true,

  examType () {
    return this.belongsTo('ExamType', 'exam_type_id')
  },
})

export default ExamIntroPage
