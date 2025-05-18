const tableName = 'students'
const columnName = 'is_ts_attached_to_pts'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(true)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
