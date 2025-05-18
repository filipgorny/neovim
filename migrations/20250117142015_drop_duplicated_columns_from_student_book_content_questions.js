const tableName = 'student_book_content_questions'
const columnNameA = 'type'
const columnNameB = 'question'
const columnNameC = 'answer_definition'
const columnNameD = 'correct_answers'
const columnNameE = 'explanation'
const columnNameF = 'student_course_id'
const columnNameG = 'order'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
    table.dropColumn(columnNameB)
    table.dropColumn(columnNameC)
    table.dropColumn(columnNameD)
    table.dropColumn(columnNameE)
    table.dropColumn(columnNameG)

    table.uuid(columnNameF)

    table
      .foreign(columnNameF)
      .references('id')
      .inTable('student_courses')
      .onDelete('CASCADE')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.string(columnNameA)
    table.text(columnNameB)
    table.text(columnNameC)
    table.string(columnNameD)
    table.text(columnNameE)
    table.integer(columnNameG)

    table.dropColumn(columnNameF)
  })
)
