const tableName = 'student_completion_meters'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('student_course_id').notNullable()
    table.integer('oil_level').notNullable().defaultTo(0)

    table.unique('student_course_id')

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
