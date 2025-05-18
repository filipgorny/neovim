const tableName = 'chat_history'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').index()
    table.uuid('context_id')
    table.string('role').notNullable()
    table.text('message').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
