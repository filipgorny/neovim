const tableName = 'exam_sections'
const columnName = 'scaled_score_template_id'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName)

    table
      .foreign('scaled_score_template_id')
      .references('id')
      .inTable('scaled_score_templates')
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
