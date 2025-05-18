const tableName = 'student_book_content_flashcards'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.text('question').nullable().alter()
    table.text('explanation').nullable().alter()
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.text('question').nullable().alter()
    table.text('explanation').nullable().alter()
  })
)
