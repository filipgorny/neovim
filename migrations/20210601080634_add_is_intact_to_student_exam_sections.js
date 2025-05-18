const tableName = 'student_exam_sections'
const columnNameIsIntact = 'is_intact'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameIsIntact).defaultTo(true)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameIsIntact)
  })
)
