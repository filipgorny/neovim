const tableName = 'student_tasks'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('task_id').notNullable()
    table.boolean('is_completed').notNullable().defaultTo(false)
    table.timestamp('completed_at')
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')

    table
      .foreign('task_id')
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
