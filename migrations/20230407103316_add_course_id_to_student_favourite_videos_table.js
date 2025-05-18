const tableName = 'student_favourite_videos'
const columnName = 'course_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.uuid(columnName).notNullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('student_courses')
      .onDelete('CASCADE')
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
