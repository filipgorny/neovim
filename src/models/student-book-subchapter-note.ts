import Bookshelf from 'bookshelf'

const StudentBookSubchapterNote = (bookshelf: Bookshelf) => bookshelf.model('StudentBookSubchapterNote', {
  tableName: 'student_book_subchapter_notes',
  uuid: true,

  subchapter () {
    return this.belongsTo('StudentBookSubchapter', 'subchapter_id')
  },
})

export default StudentBookSubchapterNote
