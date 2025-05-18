const tableName = 'course_end_date_days'
const columnNameA = 'course_tutor_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnNameA).nullable()

    table
      .foreign(columnNameA)
      .references('id')
      .inTable('course_tutors')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })
)
