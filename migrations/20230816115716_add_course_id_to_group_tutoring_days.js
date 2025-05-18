const tableName = 'group_tutoring_days'
const columnName = 'course_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).notNullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('courses')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
