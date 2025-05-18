const tableName = 'books'
const columnName = 'header_abreviation'
const newColumnName = 'header_abbreviation'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.renameColumn(columnName, newColumnName)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.renameColumn(newColumnName, columnName)
  })
)
