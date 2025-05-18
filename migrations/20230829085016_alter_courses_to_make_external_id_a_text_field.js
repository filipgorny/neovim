const tableName = 'courses'
const columnName = 'external_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.text(columnName).alter()
  })
)

const down = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.string(columnName).alter()
  })
)
