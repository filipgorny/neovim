const tableName = 'videos'
const columnName = 'category'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.alterTable(tableName, table => {
    table.string(columnName).defaultTo(null).alter()
  })
)

const dropColumns = knex => (
  knex.schema.alterTable(tableName, table => {
    table.string(columnName).defaultTo('books').alter()
  })
)
