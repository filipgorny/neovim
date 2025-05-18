const tableName = 'student_course_end_date_days'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id').notNullable()
    table.uuid('course_end_date_days_id').notNullable()

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
      .onDelete('CASCADE')

    table
      .foreign('course_end_date_days_id')
      .references('id')
      .inTable('course_end_date_days')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
