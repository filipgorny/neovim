const tableName = 'exams'
const columnName = 'access_period'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.table(tableName, table => {
    table.dropUnique(columnName)
    table.dropIndex(columnName)
  })
)

const dropColumns = knex => (
  knex.schema.alterTable(tableName, table => {
    table.integer(columnName).index().alter()
  })
)
