const tableName = 'course_end_date_days'
const columnName = 'exam_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).nullable().index()

    table
      .foreign(columnName)
      .references('id')
      .inTable('exams')
      .onDelete('SET NULL')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
