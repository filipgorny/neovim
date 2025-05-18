const tableName = 'student_calendar_events'
const columnName = 'student_exam_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).index().nullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('student_exams')
      .onDelete('CASCADE')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
