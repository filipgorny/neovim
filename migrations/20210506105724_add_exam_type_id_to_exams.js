const tableName = 'exams'
const columnName = 'exam_type_id'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).nullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('exam_types')
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
