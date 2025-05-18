const tableName = 'student_exams'
const columnNameTimeLeft = 'exam_seconds_left'
const columnNameLastOpenedPage = 'current_page'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.text(columnNameTimeLeft)
    table.string(columnNameLastOpenedPage)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameTimeLeft)
    table.dropColumn(columnNameLastOpenedPage)
  })
)
