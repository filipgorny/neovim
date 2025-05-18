const tableName = 'student_courses'
const columnName = 'extension_calendar_modal_closed'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(false)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
