const tableName = 'custom_event_types'
const columnName = 'duration'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.integer(columnName).notNullable().defaultTo(375)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
