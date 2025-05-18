const tableName = 'student_calendar_days_off'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id').notNullable()
    table.date('day_off_date').notNullable()

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
