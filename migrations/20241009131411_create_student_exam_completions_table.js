const tableName = 'student_exam_completions'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('student_exam_id').notNullable()
    table.text('scores').notNullable()
    table.string('scores_status').notNullable()
    table.timestamp('completed_at').defaultTo(knex.fn.now())

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')

    table
      .foreign('student_exam_id')
      .references('id')
      .inTable('student_exams')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
