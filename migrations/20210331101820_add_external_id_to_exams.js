const tableName = 'exams'
const columnName = 'external_id'

exports.up = async knex => addColumns(knex)
exports.down = async knex => dropColumns(knex)

const addColumns = knex => (
  knex.schema.table(tableName, table => {
    table.string(columnName).index().unique()
  })
)

const dropColumns = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
