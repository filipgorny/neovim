const tableName = 'exam_sections'
const columnName = 'full_title'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = async (knex) => knex.schema.table(tableName, table => {
    table.string(columnName)
  })

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
