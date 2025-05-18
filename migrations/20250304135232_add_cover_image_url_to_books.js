const tableName = 'books'
const columnName = 'cover_image_url'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.string(columnName).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
