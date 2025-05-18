const tableName = 'student_book_content_flashcards'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.string('question_image').nullable().alter()
    table.string('explanation_image').nullable().alter()
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.string('question_image').nullable().alter()
    table.string('explanation_image').nullable().alter()
  })
)
