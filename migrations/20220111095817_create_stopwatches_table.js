const tableName = 'stopwatches'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
      table.uuid('course_id').notNullable()

      table.uuid('student_id').notNullable()

      table.date('date').notNullable()

      table.text('state').notNullable()

      table.integer('seconds').notNullable()

      table.primary(['course_id', 'student_id', 'date'])

      table
          .foreign('course_id')
          .references('id')
          .inTable('book_courses')

      table
          .foreign('student_id')
          .references('id')
          .inTable('students')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
