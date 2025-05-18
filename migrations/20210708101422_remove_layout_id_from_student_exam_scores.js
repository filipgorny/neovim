const tableName = 'student_exam_scores'
const columnName = 'exam_layout_id'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropUnique(['student_id', 'exam_type_id', 'exam_layout_id'])

    table.dropColumn(columnName)

    table.unique(['student_id', 'exam_type_id'])
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropUnique(['student_id', 'exam_type_id'])

    table.uuid(columnName)

    table.unique(['student_id', 'exam_type_id', 'exam_layout_id'])

    table
      .foreign(columnName)
      .references('id')
      .inTable('layouts')
  })
)
