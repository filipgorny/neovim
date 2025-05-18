const tableName = 'student_courses'
const columnName = 'end_date_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).nullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('course_end_dates')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
