const tableName = 'courses'
const columnName = 'is_calendar_enabled'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(true)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
