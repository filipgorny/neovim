const tableName = 'student_book_content_flashcards'
const columnNameA = 'question'
const columnNameB = 'explanation'
const columnNameC = 'question_html'
const columnNameD = 'explanation_html'
const columnNameE = 'question_image'
const columnNameF = 'explanation_image'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
    table.dropColumn(columnNameB)
    table.dropColumn(columnNameC)
    table.dropColumn(columnNameD)
    table.dropColumn(columnNameE)
    table.dropColumn(columnNameF)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.text(columnNameA).nullable()
    table.text(columnNameB).nullable()
    table.text(columnNameC).nullable()
    table.text(columnNameD).nullable()
    table.string(columnNameE).nullable()
    table.string(columnNameF).nullable()
  })
)
