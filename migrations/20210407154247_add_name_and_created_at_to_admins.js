const tableName = 'admins'
const nameColumn = 'name'
const dateColumn = 'created_at'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.string(nameColumn).nullable()
    table.timestamp(dateColumn)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(nameColumn)
    table.dropColumn(dateColumn)
  })
)
