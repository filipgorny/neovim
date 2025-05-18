const tableName = 'book_subchapters'
const columnName = 'title'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.table(tableName, table => {
    table.dropUnique(columnName)
  })
)

const dropColumns = knex => {}
