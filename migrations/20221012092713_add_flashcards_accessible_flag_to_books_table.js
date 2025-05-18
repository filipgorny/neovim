const tableName = 'books'
const columnName = 'flashcards_accessible'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).notNullable().defaultTo(true)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
