const tableName = 'student_tokens'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable().unique()
    table.string('token').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
