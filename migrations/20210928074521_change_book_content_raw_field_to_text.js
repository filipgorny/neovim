const tableName = 'book_contents'
const columnName = 'raw'

exports.up = async knex => jsonToText(knex)
exports.down = async knex => textToJson(knex)

const jsonToText = knex => (
  knex.schema.alterTable(tableName, table => {
    table.text(columnName).alter()
  })
)

const textToJson = knex => (
  knex.schema.alterTable(tableName, table => {
    table.string(columnName).notNullable().alter()
  })
)
