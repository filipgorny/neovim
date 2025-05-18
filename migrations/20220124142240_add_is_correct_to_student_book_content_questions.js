const tableName = 'student_book_content_questions'
const columnNameIsCorrect = 'is_correct'
const columnNameAnsweredAt = 'answered_at'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameIsCorrect)
    table.timestamp(columnNameAnsweredAt)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameIsCorrect)
    table.dropColumn(columnNameAnsweredAt)
  })
)
