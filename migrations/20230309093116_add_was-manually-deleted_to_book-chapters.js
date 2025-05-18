const tableName = 'book_chapters'
const columnName = 'was_manually_deleted'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).notNullable().defaultTo(false)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
